# Proxy.js

<p align="center">
<img src="https://i.imgur.com/6Ne4V1K.png">
<a href="#Installation">Getting Started</a> | 
<a href="#Usage">Usage</a> |
<a href="#FAQ">FAQ</a>
</p>

<p align="center">
Proxy.js is a Node library which provides a simple to use API for testing proxies.
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
const {testProxy} = require('node-proxyjs');
```

You can then run a test:
``` js
// will return 200 if the test passed and an error if the test failed

testProxy('localhost:8080', 'https://example.com', 5000, false)
  .then(result => {
    console.log(result) // > 200
  })
  .catch(err -> {
    console.log(err) // error message
  })
```
The following code will test the proxy `localhost:8080` on the endpoint `https://example.com`. If a response isn't received in 5 seconds, the test will abort.

### User/Pass Proxies
You can test proxies that are user/pass authenticated as well by simply passing `true` as the fourth parameter of `testProxy`.
``` js
// tests a user/pass authenticated proxy
testProxy('user:pass:localhost:8080', 'https://example.com', 5000, true)
  .then(result => {
    console.log(result)
  })
  .catch(err -> {
    console.log(err)
  })
```

### Multiple Tests
You can also run multiple tests concurrently and then return the results in order when they've all finished.
``` js
const {testProxy} = require('node-proxyjs')

function runTests() {
  let promises = []

  // will run 1000 tests concurrently and console.log() each result as it completes
  for(let x = 0; x < 1000; x++) {
    promises.push(testProxy('localhost:8080', 'http://example.com', 5000).then(val => {
      console.log(val)
    }).catch(err => {
      console.log(err)
    }))
  }

  return Promise.all(promises)
}

// will return all the results in order once they've all completed
runTests().then(data => {
  console.log(data)
})
```

### Using a Custom Test Function
If you just want to use your own testing function you can still create a tunneling agent with Proxy.js and pass that in the `agent` option in whatever request library you're using.
``` js
// Example using Node's HTTP library
const http = require('http')
const {TunnelAgent} = require('node-proxyjs')

var tunnelingAgent = TunnelAgent('localhost:8080', 'http://example.com')

http.get('http://example.com', {
  agent: tunnelingAgent
}, res => {
  console.log(res.statusCode)
})
```

## FAQ
**Can I test user/pass proxies?**

Yes. In version 0.0.3 you can now test user/pass authenticated proxies.