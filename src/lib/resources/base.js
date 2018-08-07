const helper = require('../helper');

const logger = helper.utils.createLogger({name: "lib_request_base"});

class Base {
  constructor(configures, other) {
    for (let name in configures) {
      try {
        this[name] = this.__buildResourcePromise(name, configures[name], other);
      } catch (err) {
        logger.warn({err}, `资源初始化异常【${name}】`);
      }
    }
  }
  __buildResourcePromise(name, configure, other) {
    throw new Error('未实现');
  }
}

module.exports = Base;