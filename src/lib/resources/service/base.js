const request = require('request-promise-native');
const helper = require('../../helper');

const logger = helper.utils.createLogger({name: "lib_resources_service"});

const REQUEST = Symbol('request');
class BaseApiService {
  constructor(config) {
    let baseUrl = config.uri;
    let opts = Object.assign({
      forever: true,
      timeout: 10000,
      json: true,
      proxy: process.env.VIPC_RES_LOCAL_PROXY || undefined,
    }, config.options, {baseUrl});

    this[REQUEST] = request.defaults(opts);
    // this.request = request.defaults(opts);
  }

  async request(options) {
    let start = Date.now();
    try {
      return await this[REQUEST](options);
    } finally {
      let elapsedTime = Date.now() - start;
      if (elapsedTime > 500)
        logger.warn({options}, `接口缓慢，耗时 ${elapsedTime} 毫秒`);
    }
  }
}

module.exports = BaseApiService;
