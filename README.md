# Proxy.js

<p align="center">
<img src="https://i.imgur.com/6Ne4V1K.png">
<a href="#Installation">Getting Started</a> | 
<a href="#Usage">Usage</a> |
<a href="#FAQ">FAQ</a>
</p>

<p align="center">
Proxy.js is a Node library which provides a simple to use API for testing proxies and creating proxy agents.
</p>

<p align="center">
<img src="https://img.shields.io/npm/dw/node-proxyjs?style=for-the-badge">
<img src="https://img.shields.io/bundlephobia/min/node-proxyjs?style=for-the-badge">
</p>

## Getting Started
-----

### Installation

Using NPM:
```
$ npm install node-proxyjs
```
Using Yarn:
```
$ yarn add node-proxyjs
```
### Usage

The best way to load Proxy.js is via `require`:
``` js
const testProxy = require('node-proxyjs');
```

You can then run a test:
``` js
testProxy('localhost:8080', 'https://example.com', 5000)
  .then(result => console.log(result))
  .catch(error => console.log(error))
```
Will return:
``` js
{ status: 'OK', response: '500ms' } // Passed
{ status: 'FAIL', response: '404' } // Failed
{ status: 'ERROR', response: 'Timeout' } // Timed out
```

The following code will test the proxy `localhost:8080` on the endpoint `https://example.com`. If a response isn't received in 5 seconds, the test will abort and return an __ERROR__ response.

### User/Pass Proxies
You can test proxies that are user/pass authenticated as well.
``` js
// tests a user/pass authenticated proxy
testProxy('localhost:8080:user:pass', 'https://example.com', 5000)
  .then(result => console.log(result))
  .catch(error => console.log(error))
```

### Using With HTTP/S Libraries
If you just want to use your own testing function or simply use Proxy.js to create a proxy agent, you can still create a proxy agent and pass that in the `agent` option in whatever request library you're using.
``` js
// Example using Node's HTTP library
const http = require('http')
const ProxyAgent = require('node-proxyjs')

var proxyAgent = new ProxyAgent('http://localhost:8080')
// or for user/pass
var proxyAgent = new ProxyAgent('http://user:pass@localhost:8080')

http.get('http://example.com', {
  agent: proxyAgent
}, res => {
  console.log(res.statusCode)
})
```

## Changelog
- As of version `0.0.5`, Proxy.js has been rewritten in TypeScript.
- As of version `0.0.3`, you can now test user/pass authenticated proxies.