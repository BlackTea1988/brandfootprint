const moment = require('moment');
const createError = require('http-errors');
const common = require('../common');
const configs = require('../configs');

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

  async statusList() {
    let orderStatus = common.enum.orderStatus;
    ctx.body = [
      [orderStatus.CreateOrder, '等待支付'],
      [orderStatus.UnifiedOrder, '等待支付'],
      [orderStatus.CompletePayment, '等待发货'],
      [orderStatus.CompleteExpress, '等待收货'],
      [orderStatus.AllFinish, '订单完成'],
    ].map(list => {
      return {key: list[0], value: list[1]};
    });
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

    const xml = ctx.request.body.xml;

    if (xml.return_code !== 'SUCCESS')
      throw new createError.BadRequest('无效消息');

    let expectedSign = common.wechat.buildSign(xml, configs.account.wechatPay.Secret);
    if (expectedSign !== xml.sign)
      throw new createError.Unauthorized('无效签名');

    // 检查订单号是否存在
    let orderId = new common.helper.ObjectID(xml.out_trade_no);
    let order = await ctx.models.order.getById(orderId);
    if (!order)
      throw new createError.Unauthorized('无效订单');

    // 标记为已支付
    order = await ctx.models.order.completePayment(order._id, xml);

    // 发送微信通知
    await ctx.models.wechat.epSendNotice(order);

    ctx.set('Content-Type', 'application/xml');
    ctx.body = [
      '<xml>',
      '<return_code><![CDATA[SUCCESS]]></return_code>',
      '<return_msg><![CDATA[OK]]></return_msg>',
      '</xml>',
    ].join('');
  }
}

module.exports = OrderController;