const util = require('util');
const Koa = require('koa');
const Router = require('koa-router');

const helper = require('./helper');
const Resources = require('./resources');

const logger = helper.utils.createLogger({name: "lib_service"});

class VIPCService {
  constructor(options) {
    this.__options__ = options;
  }
  async start() {
    let options = this.__options__;
    // try {
    //
    //   let resources = await Resources.build(options.resource, {
    //     services: options.services,
    //   });
    // } catch (err) {
    //   return console.log(err)
    // }
    let resources = await Resources.build(options.resource, {
      services: options.services,
    });
    let models = await buildModels(options.models, resources);
    let controllers = buildControllers(options.controllers, models);
    let routes = buildRoutes(options.router, controllers);
    let middleware = new helper.MiddlewareModel(options.middleware);

    let app = new Koa();
    app.proxy = true;

    app.use(middleware.timeout);
    app.use(middleware.slowly);
    app.use(middleware.notFound);
    app.use(middleware.exception);
    app.use(middleware.bodyParser);
    app.use(middleware.accessControlAllowApi);
    app.use(middleware.inject({models}));

    if (routes.initialize)
      routes.initialize(app);

    process.on('unhandledRejection', (reason, p) => {
      logger.warn(p, 'unhandled rejection');
    });

    process.on('rejectionHandled', (p) => {
      logger.info(p, 'rejection unhandled');
    });

    process.on('uncaughtException', (err) => {
      logger.fatal({err}, 'uncaught exception');
    });

    let router = new Router();

    // 用于外部（用户）访问
    if (routes.api) router.use(`/api`, routes.api.routes());
    // 用于内部（后台）访问
    if (routes.admin) router.use(`/admin`, routes.admin.routes());
    if (routes.other) router.use(`/_`, routes.other.routes());
    if (routes.web) router.use(routes.web.routes());

    app.use(router.routes());

    const listenAsync = util.promisify(app.listen).bind(app);
    await listenAsync(options.port);

    return options;
  }
}

module.exports = VIPCService;

async function buildModels(models, resources) {
  let results = {};

  let common = models.common
    ? new models.common(resources)
    : { initialize: () => {} };
  await common.initialize();
  delete models.common;

  for (let name in models) {
    let Model = models[name];
    let model = new Model(resources, common);
    if (model.initialize) await model.initialize();
    results[name] = model;
  }
  return results;
}

function buildControllers(controllers, models) {
  let results = {};
  for (let name in controllers) {
    let Controller = controllers[name];
    results[name] = new Controller(models);
  }
  return results;
}

function buildRoutes(router, controllers) {
  let results = {};
  for (let name in router) {
    if (name === 'initialize') {
      results[name] = router[name];
    } else {
      let Model = router[name];
      results[name] = new Model(controllers);
    }
  }
  return results;
}
