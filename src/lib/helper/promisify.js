const _ = require('lodash');

function promisify(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  //if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  //if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (_.isArray(obj)) return arrayToPromise.call(this, obj);
  if (_.isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * 检查是否为 Promise 对象
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
function isPromise(obj) {
  return 'function' == typeof obj.then
    && 'function' == typeof obj.catch;
}

/**
 * 将数组转为 Promise 对象
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */
function arrayToPromise(obj) {
  return Promise.all(obj.map(promisify, this));
}

/**
 * 将对象转为 Promise 对象
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */
function objectToPromise(obj){
  let results = new obj.constructor(), promises = [];

  let keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let promise = promisify.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(() => results);

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

module.exports = promisify;