const Cache = require('node-cache');
const { scanInterval } = require('c0nfig');

const key = 'scan-memory';
const scanCache = new Cache({
  stdTTL: scanInterval / 1000 // in seconds
});

function get () {
  return new Promise(resolve => {
    resolve(scanCache.get(key));
  });
}

function set (obj) {
  scanCache.set(key, obj);
}

module.exports = { get, set };
