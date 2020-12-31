"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ProxyAgent = require('./createAgent');
const { AbortController } = require('abort-controller');
const fetch = require('node-fetch');
const controller = new AbortController();
function testProxy(proxy, endpoint, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof proxy === undefined || typeof endpoint === undefined)
            throw new Error('Proxy or endpoint undefined');
        let isUserPass;
        if (proxy.split(':').length - 1 === 3) {
            isUserPass = true;
        }
        else {
            isUserPass = false;
        }
        if (!timeout) {
            timeout = 5000;
        }
        const timeoutSignal = setTimeout(() => { controller.abort(); }, timeout);
        var startTime = new Date().getTime();
        var p = new Promise((resolve, reject) => {
            if (isUserPass) {
                var proxyHost = proxy.split(':')[0];
                var proxyPort = proxy.split(':')[1];
                var proxyUser = proxy.split(':')[2];
                var proxyPass = proxy.split(':')[3];
                var proxy_url = proxy.includes('http') ? proxy : `http://${proxyUser}:${proxyPass}@${proxyHost}:${proxyPort}`;
                var agent = new ProxyAgent(proxy_url);
                fetch(endpoint, {
                    agent,
                    signal: controller.signal
                })
                    .then(res => {
                    if (res.status >= 200 && res.status < 300) {
                        var endTime = new Date().getTime() - startTime;
                        resolve({ status: 'OK', response: `${endTime}ms` });
                        clearTimeout(timeoutSignal);
                    }
                    else {
                        resolve({ status: 'FAIL', response: res.status });
                        clearTimeout(timeoutSignal);
                    }
                })
                    .catch(err => {
                    if (err.type === 'aborted') {
                        reject({ status: 'ERROR', response: 'TIMEOUT' });
                        clearTimeout(timeoutSignal);
                    }
                    else {
                        reject({ status: 'ERROR', response: err.code });
                        clearTimeout(timeoutSignal);
                    }
                });
            }
            else {
                var proxy_url = proxy.includes('http') ? proxy : `http://${proxy}`;
                var agent = new ProxyAgent(proxy_url);
                fetch(endpoint, {
                    agent,
                    signal: controller.signal
                })
                    .then(res => {
                    if (res.status >= 200 && res.status < 300) {
                        var endTime = new Date().getTime() - startTime;
                        resolve({ status: 'OK', response: `${endTime}ms` });
                        clearTimeout(timeoutSignal);
                    }
                    else {
                        resolve({ status: 'FAIL', response: res.status });
                        clearTimeout(timeoutSignal);
                    }
                })
                    .catch(err => {
                    if (err.type === 'aborted') {
                        reject({ status: 'ERROR', response: 'TIMEOUT' });
                        clearTimeout(timeoutSignal);
                    }
                    else {
                        reject({ status: 'ERROR', response: err.code });
                        clearTimeout(timeoutSignal);
                    }
                });
            }
        });
        return p;
    });
}
module.exports = testProxy;
//# sourceMappingURL=index.js.map