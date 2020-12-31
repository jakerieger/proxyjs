/**
 * index.js
 * Author: Jake Rieger
 * 
 * Check the docs at github.com/jakerieger/proxyjs/README.md
 */

const fetch = require('node-fetch')
const {AbortController} = require('abort-controller')
const {TunnelAgent} = require('../src/createAgent')

const controller = new AbortController()
/**
 * Tests a proxy by connecting to the proxy server provided then making an HTTP/S request to the provided endpoint and returns the status code.
 * Expects proxies in the form of protocol://host:port or host:port - user/pass not currently supported.
 * @param {String} proxy The proxy URL which can include or exclude the protocol. A proxy that doesn't include a protocol will default to HTTP
 * @param {String} endpoint The endpoint URL the proxy will be connecting to => http://example.com
 * @param {Number} timeout The time in milliseconds to wait for a response to come back before aborting the request
 * @param {Boolean} isUserPass Optional; Whether or not your proxy is user/pass
 */
async function testProxy(proxy, endpoint, timeout, isUserPass) {
  if (isUserPass === undefined) {
    isUserPass = false
  }

  const startTime = new Date().getTime()

  const timeoutSignal = setTimeout(
    () => { controller.abort(); },
    timeout
  )

  var p = new Promise((resolve, reject) => {
      fetch(endpoint, {
      signal: controller.signal,
      agent: TunnelAgent(proxy, endpoint, isUserPass)
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          var endTime = new Date().getTime() - startTime
          resolve({
            status: 'OK',
            response: `${endTime}ms`
          })
          clearTimeout(timeoutSignal)
        } else {
          reject({
            status: 'FAIL',
            response: res.status
          })
          clearTimeout(timeoutSignal)
        }
      })
      .catch(error => {
        if (error.type === 'aborted') {
          reject({
            status: 'ERROR',
            response: 'Timeout'
          })
        } else {
          reject({
            status: 'ERROR',
            response: error.code
          })
        }
        clearTimeout(timeoutSignal)
      })
    }
  )
  
  return p
}

exports.testProxy = testProxy
exports.TunnelAgent = TunnelAgent