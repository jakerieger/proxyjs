/// <reference types="node" />
import net from 'net';
import tls from 'tls';
import url from 'url';
import { OutgoingHttpHeaders } from 'http';
import { Agent, ClientRequest, RequestOptions, AgentOptions } from 'agent-base';
/**
 * Credit https://github.com/TooTallNate for this code
 */
declare class ProxyAgent extends Agent {
    private secureProxy;
    private proxy;
    constructor(_opts: string | createProxyAgent.ProxyAgentOptions);
    callback(req: ClientRequest, opts: RequestOptions): Promise<net.Socket>;
}
declare function createProxyAgent(opts: string | createProxyAgent.ProxyAgentOptions): ProxyAgent;
declare namespace createProxyAgent {
    interface BaseProxyAgentOptions {
        headers?: OutgoingHttpHeaders;
        secureProxy?: boolean;
        host?: string | null;
        path?: string | null;
        port?: string | number | null;
    }
    export interface ProxyAgentOptions extends AgentOptions, BaseProxyAgentOptions, Partial<Omit<url.Url & net.NetConnectOpts & tls.ConnectionOptions, keyof BaseProxyAgentOptions>> {
    }
    export {};
}
export = createProxyAgent;
