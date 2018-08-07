const path = require('path');
const serve = require('koa-static');
const configs = require('../configs');

const resourcesRoot = path.resolve(__dirname, '..', configs.web.resourcesRelativePath);

module.exports = {
  api: require('./api'),
  // admin: require('./admin'),
  // other: require('./other'),

  initialize(app) {
    app.use(serve(resourcesRoot));
  }
};