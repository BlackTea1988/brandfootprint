const helper = require('../helper');

const factory = {
  Redis: require('./redis'),
  Mongodb: require('./mongodb'),
  Mysql: require('./mysql'),
  Service: require('./service'),
};

module.exports = {
  async build(config, {services}) {
    return await helper.promisify({
      redis: new factory.Redis(config.redis),
      mongodb: new factory.Mongodb(config.mongodb),
      mysql: new factory.Mysql(config.mysql),
      service: new factory.Service(config.service, services),
    });
  }
};
