const lib = require('./lib');
const config = require('./configs');

new lib.VIPCService({
  hostname: config.hostname,
  port: config.port,
  middleware: config.middleware,
  router: require('./router'),
  models: require('./models'),
  services: require('./services'),
  controllers: require('./controllers'),
  resource: config.resource,
}).start()
  .then(res => console.log(`服务启动成功：http://${res.hostname || 'localhost'}:${res.port}`))
  .catch(err => console.error(`服务启动失败：`, err));