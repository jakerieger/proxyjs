const tunnel = require('tunnel');

/**
 * 
 * @param {String} proxy The proxy URL which can include or exclude the protocol. A proxy that doesn't include a protocol will default to HTTP
 * @param {String} endpoint The endpoint URL the proxy will be connecting to => http://example.com
 * @param {Boolean} isUserPass - Optional; pass in true if your proxy is user/pass
 */
function TunnelAgent(proxy, endpoint, isUserPass) {
  if (proxy === undefined || endpoint === undefined) {
    throw new Error('Missing parameter proxy or endpoint')
  }

  if(isUserPass === undefined) {
    isUserPass = false
  }

  var endpointProtocol = endpoint.split(':')[0]
  var proxyProtocol = proxy.split('/')[0]
  var proxyEndpoint
  var userPass = {}

  // check if proxy includes a protocol, i.e. http://localhost:8080 vs localhost:8080
  if (proxy.includes('/')) {
    proxyEndpoint = proxy.split('/')[2]
  } else {
    proxyEndpoint = proxy
  }

  if(isUserPass) {
    userPass = {
      user: proxyEndpoint.split(':')[0],
      pass: proxyEndpoint.split(':')[1]
    }
    proxyEndpoint = `${proxyEndpoint.split(':')[2]}:${proxyEndpoint.split(':')[3]}`
  }

  var tunnelingAgent

  if (isUserPass) {
    if (endpointProtocol == 'http') {
      if (proxyProtocol == 'http:' || proxyProtocol != 'https:') {
        tunnelingAgent = tunnel.httpOverHttp({
          proxy: {
            host: proxyEndpoint.split(':')[0],
            port: proxyEndpoint.split(':')[1],
            proxyAuth: `${userPass.user}:${userPass.pass}`
          }
        })
  
        return tunnelingAgent
      } else {
        tunnelingAgent = tunnel.httpsOverHttp({
          proxy: {
            host: proxyEndpoint.split(':')[0],
            port: proxyEndpoint.split(':')[1],
            proxyAuth: `${userPass.user}:${userPass.pass}`
          }
        })
  
        return tunnelingAgent
      }
    } else if (endpointProtocol == 'https') {
      if (proxyProtocol == 'http:' || proxyProtocol != 'https:') {
        tunnelingAgent = tunnel.httpOverHttps({
          proxy: {
            host: proxyEndpoint.split(':')[0],
            port: proxyEndpoint.split(':')[1],
            proxyAuth: `${userPass.user}:${userPass.pass}`
          }
        })
  
        return tunnelingAgent
      } else {
        tunnelingAgent = tunnel.httpsOverHttps({
          proxy: {
            host: proxyEndpoint.split(':')[0],
            port: proxyEndpoint.split(':')[1],
            proxyAuth: `${userPass.user}:${userPass.pass}`
          }
        })
  
        return tunnelingAgent
      }
    } else {
      return undefined
    }
  } else {
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
}

exports.TunnelAgent = TunnelAgent