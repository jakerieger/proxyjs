const ProxyAgent = require('./createAgent');
const {AbortController} = require('abort-controller');
const fetch = require('node-fetch');

const controller = new AbortController();

/**
 * 
 * @param proxy The proxy to test. Can be in form host:port, host:port:user:pass, or http://host:port
 * @param endpoint The endpoint to test the proxy on i.e. => http://example.com
 * @param timeout (optional) time in milliseconds to wait before aborting the test
 */
async function testProxy(proxy: string, endpoint: string, timeout?: number): Promise<any> {
  if (typeof proxy === undefined || typeof endpoint === undefined)
    throw new Error('Proxy or endpoint undefined');

  let isUserPass: boolean;

  if (proxy.split(':').length - 1 === 3) {
    isUserPass = true;
  } else {
    isUserPass = false;
  }

  if (!timeout) {
    timeout = 5000;
  }

  const timeoutSignal = setTimeout(
    () => { controller.abort(); },
    timeout
  );

  let startTime: number = new Date().getTime();

  let p = new Promise<any>((resolve, reject) => {
    if (isUserPass) {
      var proxyHost: string = proxy.split(':')[0];
      var proxyPort: string = proxy.split(':')[1];
      var proxyUser: string = proxy.split(':')[2];
      var proxyPass: string = proxy.split(':')[3];
      var proxy_url: string = proxy.includes('http') ? proxy : `http://${proxyUser}:${proxyPass}@${proxyHost}:${proxyPort}`;
      var agent = new ProxyAgent(proxy_url);
      fetch(endpoint, {
        agent,
        signal: controller.signal
      })
        .then(res => {
          if (res.status >= 200 && res.status < 300) {
            var endTime: number = new Date().getTime() - startTime;
            resolve({status: 'OK', response: `${endTime}ms`});
            clearTimeout(timeoutSignal);
          } else {
            resolve({status: 'FAIL', response: res.status});
            clearTimeout(timeoutSignal);
          }
        })
        .catch(err => {
          if (err.type === 'aborted') {
            reject({status: 'ERROR', response: 'TIMEOUT'});
            clearTimeout(timeoutSignal);
          } else {
            reject({status: 'ERROR', response: err.code});
            clearTimeout(timeoutSignal);
          }
        })
    } else {
      var proxy_url: string = proxy.includes('http') ? proxy : `http://${proxy}`;
      var agent = new ProxyAgent(proxy_url)
      fetch(endpoint, {
        agent,
        signal: controller.signal
      })
        .then(res => {
          if (res.status >= 200 && res.status < 300) {
            var endTime: number = new Date().getTime() - startTime;
            resolve({status: 'OK', response: `${endTime}ms`});
            clearTimeout(timeoutSignal)
          } else {
            resolve({status: 'FAIL', response: res.status});
            clearTimeout(timeoutSignal);
          }
        })
        .catch(err => {
          if (err.type === 'aborted') {
            reject({status: 'ERROR', response: 'TIMEOUT'});
            clearTimeout(timeoutSignal);
          } else {
            reject({status: 'ERROR', response: err.code});
            clearTimeout(timeoutSignal);
          }
        })
    }
  })

  return p;
}

export = testProxy;