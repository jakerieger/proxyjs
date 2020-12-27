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

## Getting Started
-----

### Installation

Using NPM:
```
$ npm install proxyjs
```
Using Yarn:
```
$ yarn add proxyjs
```
### Usage

The best way to load Proxy.js is via `require`:
```
const {runTest} = require('proxyjs');
```

You can then run a test:
```
runTest(proxy, endpoint, timeout);
```

Example:
```
// will return 'OK' if the proxy tested good and 'Failed' if the proxy fails.

runTest('localhost:8080', 'https://example.com', 5000);
```
The following code will test the proxy `localhost:8080` on the endpoint `https://example.com`. If a response isn't received in 5 seconds, the test will abort.

## FAQ
-----
**Can I test user/pass proxies?**

No. At the moment Proxy.js only supports unauthenticated proxies. However, this feature is on the priority list and will be added in the next update.