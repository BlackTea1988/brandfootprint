const moment = require('moment');
const createError = require('http-errors');
const common = require('../common');

const logger = common.helper.createLogger({name: 'ctrl_order'});

const nonceCache = {};

class OrderController {
  paramsOrderId(orderId, ctx, next) {
    try {
      ctx.params.orderId = new common.helper.ObjectID(orderId);
      return next();
    } catch (e) {
      throw new createError.BadRequest('无效订单编号');
    }
  }

  // 创建订单
  async create(ctx, next) {
    const {account} = ctx.state;
    if (!account) throw new createError.Unauthorized('无效用户');

    const nonce = [account._id, ctx.query.t].join("|");
    if (nonceCache[nonce]) throw new createError.Conflict('请勿重复提交订单');
    nonceCache[nonce] = true;

    try {
      let body = Object.assign({}, ctx.request.body, {realIp: ctx.ip});
      let order = await ctx.models.order.create(account, body);

      ctx.body = common.helper.modifyId(order);
    } finally {
      delete nonceCache[nonce];
    }
  }

  async getById(ctx, next) {
    let order = await ctx.models.order.getById(ctx.params.orderId);
    ctx.body = common.helper.modifyId(order);
  }

  async queryByAccountId(ctx, next) {
    const {account} = ctx.state;
    if (!account) throw new createError.Unauthorized('无效用户');

    let items = await ctx.models.order.queryByAccountId(account._id);

    ctx.body = {
      items: items.map(common.helper.modifyId),
    };
  }

  async notice(ctx, next) {
    logger.info(ctx.request.body, '通知');
    ctx.body = {ok: 1};
  }
}

module.exports = OrderController;