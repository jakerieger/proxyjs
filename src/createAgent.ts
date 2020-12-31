import net from 'net';
import tls from 'tls';
import url from 'url';
import {OutgoingHttpHeaders} from 'http';
import {Agent, ClientRequest, RequestOptions, AgentOptions} from 'agent-base';
import createDebug from 'debug'
import { Readable } from 'stream';

const debug = createDebug('ProxyAgent:Agent');

/**
 * Credit https://github.com/TooTallNate for this code
 */

class ProxyAgent extends Agent {
  private secureProxy: boolean;
  private proxy: createProxyAgent.ProxyAgentOptions;

  constructor(_opts: string | createProxyAgent.ProxyAgentOptions) {
    let opts: createProxyAgent.ProxyAgentOptions

    if (typeof _opts === 'string') {
      opts = url.parse(_opts)
    } else {
      opts = _opts
    }

    if (!opts) {
      throw new Error (
        'an HTTP/S proxy server `host` and `port` must be specified!'
      )
    }

    debug(`creating new ProxyAgent instance: ${opts}`);
    super(opts);

    const proxy: createProxyAgent.ProxyAgentOptions = {...opts};

    this.secureProxy = opts.secureProxy || isHTTPS(proxy.protocol);

    proxy.host = proxy.hostname || proxy.host;
    if (typeof proxy.port === 'string') {
      proxy.port = parseInt(proxy.port, 10)
    }
    if (!proxy.port && proxy.host) {
      proxy.port = this.secureProxy ? 443 : 80;
    }

    if (this.secureProxy && !('ALPNProtocols' in proxy)) {
      proxy.ALPNProtocols = ['http 1.1'];
    }

    if (proxy.host && proxy.path) {
      delete proxy.path;
      delete proxy.pathname;
    }

    this.proxy = proxy;
  }

  async callback(
    req: ClientRequest,
    opts: RequestOptions
  ): Promise<net.Socket> {
    const { proxy, secureProxy } = this;
     let socket: net.Socket;
     if (secureProxy) {
       debug('Created `tls.socket`: %o', proxy);
       socket = tls.connect(proxy as tls.ConnectionOptions);
     } else {
       debug('Creating `net.Socket`: %o', proxy);
       socket = net.connect(proxy as net.NetConnectOpts);
     }

     const headers: OutgoingHttpHeaders = {...proxy.headers}
     const hostname = `${opts.host}:${opts.port}`;
     let payload = `CONNECT ${hostname} HTTP/1.1\r\n`;

     if (proxy.auth) {
       headers['Proxy-Authorization'] = `Basic ${Buffer.from(proxy.auth).toString('base64')}`;
     }

     let { host, port, secureEndpoint } = opts;
     if (!isDefaultPort(port, secureEndpoint)) {
       host += `:${port}`;
     }

     headers.Host = host;

     headers.Connection = 'close';
     for (const name of Object.keys(headers)) {
       payload += `${name}: ${headers[name]}\r\n`
     }

     const proxyResponsePromise = parseProxyResponse(socket);

     socket.write(`${payload}\r\n`);

     const {
       statusCode,
       buffered
     } = await proxyResponsePromise;

     if (statusCode === 200) {
       req.once('socket', resume);
       if (opts.secureEndpoint) {
         debug('Upgrading socket connection to TLS');
         const servername = opts.servername || opts.host
         return tls.connect({
           ...omit(opts, 'host', 'hostname', 'path', 'port'),
           socket,
           servername
         });
       }

       return socket;
     }

     socket.destroy();

     const fakeSocket = new net.Socket({writable: false});
     fakeSocket.readable = true;

     req.once('socket', (s: net.Socket) => {
       debug('replaying proxy buffer for failed request');
     });

     return fakeSocket;
  }
}

function resume(socket: net.Socket | tls.TLSSocket): void {
  socket.resume();
}

function isDefaultPort(port: number, secure: boolean): boolean {
  return Boolean((!secure && port === 80) || (secure && port === 443))
}

function isHTTPS(protocol?: string | null): boolean {
  return typeof protocol === 'string' ? /^https:?$/i.test(protocol) : false;
}

function omit<T extends object, K extends [...(keyof T)[]]>(
	obj: T,
	...keys: K
): {
	[K2 in Exclude<keyof T, K[number]>]: T[K2];
} {
	const ret = {} as {
		[K in keyof typeof obj]: (typeof obj)[K];
	};
	let key: keyof typeof obj;
	for (key in obj) {
		if (!keys.includes(key)) {
			ret[key] = obj[key];
		}
	}
	return ret;
}

interface ProxyResponse {
	statusCode: number;
	buffered: Buffer;
}

function parseProxyResponse(
	socket: Readable
): Promise<ProxyResponse> {
	return new Promise((resolve, reject) => {
		// we need to buffer any HTTP traffic that happens with the proxy before we get
		// the CONNECT response, so that if the response is anything other than an "200"
		// response code, then we can re-play the "data" events on the socket once the
		// HTTP parser is hooked up...
		let buffersLength = 0;
		const buffers: Buffer[] = [];

		function read() {
			const b = socket.read();
			if (b) ondata(b);
			else socket.once('readable', read);
		}

		function cleanup() {
			socket.removeListener('end', onend);
			socket.removeListener('error', onerror);
			socket.removeListener('close', onclose);
			socket.removeListener('readable', read);
		}

		function onclose(err?: Error) {
			debug('onclose had error %o', err);
		}

		function onend() {
			debug('onend');
		}

		function onerror(err: Error) {
			cleanup();
			debug('onerror %o', err);
			reject(err);
		}

		function ondata(b: Buffer) {
			buffers.push(b);
			buffersLength += b.length;

			const buffered = Buffer.concat(buffers, buffersLength);
			const endOfHeaders = buffered.indexOf('\r\n\r\n');

			if (endOfHeaders === -1) {
				// keep buffering
				debug('have not received end of HTTP headers yet...');
				read();
				return;
			}

			const firstLine = buffered.toString(
				'ascii',
				0,
				buffered.indexOf('\r\n')
			);
			const statusCode = +firstLine.split(' ')[1];
			debug('got proxy server response: %o', firstLine);
			resolve({
				statusCode,
				buffered
			});
		}

		socket.on('error', onerror);
		socket.on('close', onclose);
		socket.on('end', onend);

		read();
	});
}

function createProxyAgent(
  opts: string | createProxyAgent.ProxyAgentOptions
): ProxyAgent {
  return new ProxyAgent(opts)
}

namespace createProxyAgent {
  interface BaseProxyAgentOptions {
    headers?: OutgoingHttpHeaders;
    secureProxy?: boolean;
    host?: string | null;
    path?: string | null;
    port?: string | number | null;
  }

  export interface ProxyAgentOptions extends AgentOptions,
    BaseProxyAgentOptions,
    Partial<
      Omit<
        url.Url & net.NetConnectOpts & tls.ConnectionOptions,
        keyof BaseProxyAgentOptions
        >
      > {}

  createProxyAgent.prototype = ProxyAgent.prototype;
}

export = createProxyAgent;