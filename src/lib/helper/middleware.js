const url = require('url');
const createError = require('http-errors');
const koaBodyParser = require('koa-bodyparser');

const xmlBodyParser = require('./xml_body_parser');
const utils = require('./utils');

const logger = utils.createLogger({name: "lib_middleware"});

class MiddlewareModel {
  constructor(options) {
    let opts = Object.assign({
      slowly: 500,
      timeout: 1000 * 10,
      useBodyParse: true,
    }, options);

    /**
     * 记录超时无响应请求
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    this.timeout = async function timeout(ctx, next) {
      let intervalId = null;
      let timeoutTask = buildTimeoutPromise(opts.timeout, ctx.request);

      await Promise.race([next(), timeoutTask]);

      return clearTimeout(intervalId);

      async function buildTimeoutPromise(ms, req) {
        await new Promise((resolve) => intervalId = setTimeout(resolve, ms));
        logger.warn(`timeout(${ms}ms) - ${req.method} ${req.url}`);
        ctx.status = 502;
        ctx.body = {ok: 0, message: '服务器繁忙，请稍后再试'};
      }
    };

    /**
     * 记录慢请求
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    this.slowly = async function slowly(ctx, next) {
      let start = Date.now();

      await next();

      if (ctx.response.headerSent) return void(0);

      let responseTime = Date.now() - start;

      if (responseTime > opts.slowly) {
        let req = ctx.request;
        logger.warn({responseTime}, `slowly(${responseTime}ms) - ${req.method} ${req.url}`);
      }
    };


    this.bodyParser = async function bodyParser(ctx, next) {
      if (!opts.useBodyParse) return await next();

      await koaBodyParser({
        onerror: (err, ctx) => ctx.throw(422, '请求内容格式错误')
      })(ctx, next);
    };

    this.xmlBodyParser = async function (ctx, next) {
      return await xmlBodyParser()(ctx, next);
    }

  }

  inject({models}) {
    return async function (ctx, next) {
      ctx.models = models;
      await next();
    };
  }

  /**
   * 统一处理 404
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  async notFound(ctx, next) {
    await next();

    if (ctx.status == 404) {
      ctx.status = 404;
      ctx.body = ctx.body || {ok: 0, message: '找不到资源'};
    } else {
      ctx.body = ctx.body || {ok: 1};
    }
  }

  /**
   * 请求异常处理
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  async exception(ctx, next) {
    try {
      await next();
    } catch (err) {
      if (err instanceof createError.HttpError && err.expose) {
        // 用户错误则输出错误消息，不打印日志
        ctx.status = err.status;
        ctx.body = Object.assign({ok: 0}, err);
      } else {
        // 程序错误则输出“服务器繁忙”，并打印日志
        let req = ctx.request;
        logger.fatal({err}, `error - ${req.method} ${req.url}`);
        ctx.status = 500;
        ctx.body = {ok: 0, message: '服务器繁忙，请稍后再试'};
      }
    }
  }

  async accessControlAllowApi (ctx, next) {
    const referer = ctx.get('referer');
    const uri = url.parse(referer || '');
    if (!uri.host) return await next();
    if (!/^(\w*\.)?vipc\.cn$/.test(uri.host)) return await next(); 
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Allow-Origin', [uri.protocol, uri.host].join('//'));
    return await next();
  }
}

module.exports = MiddlewareModel;