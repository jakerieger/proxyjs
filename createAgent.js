const tunnel = require('tunnel');

/**
 * 
 * @param {String} proxy The proxy URL which can include or exclude the protocol. A proxy that doesn't include a protocol will default to HTTP
 * @param {String} endpoint The endpoint URL the proxy will be connecting to => http://example.com
 */
function TunnelAgent(proxy, endpoint) {
  if (proxy === undefined || endpoint === undefined) {
    throw new Error('Missing parameter proxy or endpoint')
  }

  var endpointProtocol = endpoint.split(':')[0]
  var proxyProtocol = proxy.split('/')[0]
  var proxyEndpoint

  // check if proxy includes a protocol, i.e. http://localhost:8080 vs localhost:8080
  if (proxy.includes('/')) {
    proxyEndpoint = proxy.split('/')[2]
  } else {
    proxyEndpoint = proxy
  }

  var tunnelingAgent

  if (endpointProtocol == 'http') {
    if (proxyProtocol == 'http:' || proxyProtocol != 'https:') {
      tunnelingAgent = tunnel.httpOverHttp({
        proxy: {
          host: proxyEndpoint.split(':')[0],
          port: proxyEndpoint.split(':')[1]
        }
      })

      return tunnelingAgent
    } else {
      tunnelingAgent = tunnel.httpsOverHttp({
        proxy: {
          host: proxyEndpoint.split(':')[0],
          port: proxyEndpoint.split(':')[1]
        }
      })

      return tunnelingAgent
    }
  } else if (endpointProtocol == 'https') {
    if (proxyProtocol == 'http:' || proxyProtocol != 'https:') {
      tunnelingAgent = tunnel.httpOverHttps({
        proxy: {
          host: proxyEndpoint.split(':')[0],
          port: proxyEndpoint.split(':')[1]
        }
      })

      return tunnelingAgent
    } else {
      tunnelingAgent = tunnel.httpsOverHttps({
        proxy: {
          host: proxyEndpoint.split(':')[0],
          port: proxyEndpoint.split(':')[1]
        }
      })

      return tunnelingAgent
    }
  } else {
    return undefined
  }
}

exports.TunnelAgent = TunnelAgent