const Base = require('../base');

class Service extends Base {
  __buildResourcePromise(name, configure, services) {
    let ServiceClass = services[name];
    if (!ServiceClass) throw new Error(`找不到 service ：${name}`);

    return Promise.resolve(new ServiceClass(configure));
  }
}

module.exports = Service;