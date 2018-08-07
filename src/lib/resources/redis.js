const bluebird = require('bluebird');

const helper = require('../helper');
const Base = require('./base');


const logger = helper.utils.createLogger({name: "lib_resources_redis"});

const REDIS = Symbol('redis');
class Redis extends Base {

  getRedis() {
    if (!this[REDIS]) {
      let redis = require('redis');

      // https://github.com/NodeRedis/node_redis#promises
      bluebird.promisifyAll(redis.RedisClient.prototype);
      bluebird.promisifyAll(redis.Multi.prototype);

      this[REDIS] = redis;
    }

    return this[REDIS];
  }

  __buildResourcePromise(name, configure) {
    let client = this.getRedis().createClient(configure.uri, configure.options);
    client.on("error", (err) => logger.warn({err}, name));

    return Promise.resolve(client);
  }
}

module.exports = Redis;
