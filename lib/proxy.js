/**
 * index.js
 * Author: Jake Rieger
 * 
 * Check the docs at github.com/jakerieger/proxyjs/README.md
 */

const fetch = require('node-fetch');
const {AbortController} = require('abort-controller')
const {TunnelAgent} = require('./createAgent')

const controller = new AbortController()

/**
 * Tests a proxy by connecting to the proxy server provided then making an HTTP/S request to the provided endpoint and returns the status code.
 * Expects proxies in the form of protocol://host:port or host:port - user/pass not currently supported.
 * @param {String} proxy The proxy URL which can include or exclude the protocol. A proxy that doesn't include a protocol will default to HTTP
 * @param {String} endpoint The endpoint URL the proxy will be connecting to => http://example.com
 * @param {Number} timeout The time in milliseconds to wait for a response to come back before aborting the request
 */
async function testProxy(proxy, endpoint, timeout) {
  const timeoutSignal = setTimeout(
    () => { controller.abort(); },
    timeout
  )

  fetch(endpoint, {
    signal: controller.signal,
    agent: TunnelAgent(proxy, endpoint)
  })
  .then((res) => {
    if (res.status === 200) {
      return 'OK'
    }
  })
  .catch(error => console.log(error))
  .finally(() => {
    clearTimeout(timeoutSignal)
  })
}

exports.testProxy = testProxy