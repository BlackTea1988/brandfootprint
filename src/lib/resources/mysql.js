const util = require('util');
const helper = require('../helper');

const logger = helper.utils.createLogger({name: "lib_resources_mysql"});

const Base = require('./base');

class Client {
  constructor(name, config) {
    const uri = `${config.uri}?connectionLimit=400`;
    const pool = this.getMysql().createPool(uri);
    pool.on('enqueue', function () {
      logger.warn(`等待可用连接，请排查代码或者加大连接池：${name}`);
    });

    this.__pool = pool;
    this.__getConnectionAsync = util.promisify(pool.getConnection).bind(pool);
    logger.info(`mysql(${name})连接成功`);
  }

  getMysql() {
    return require('mysql');
  }

  query() {
    const pool = this.__pool;
    const list = Array.prototype.slice.call(arguments);

    return new Promise(function (resolve, reject) {
      pool.query.apply(pool, list.concat([function (err, results, fields) {
        err ? reject(err) : resolve({results, fields});
      }]));
    });
  }

  getConnection() {
    return this.__getConnectionAsync();
  }
}

class Mysql extends Base {
  __buildResourcePromise(name, configure) {
    return Promise.resolve(new Client(name, configure));
  }
}

module.exports = Mysql;
