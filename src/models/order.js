const createError = require('http-errors');
const configs = require('../configs');
const common = require('../common');

const RESOURCES = Symbol('resources');
const ORDER = Symbol('coll_order');
class OrderModel {
  constructor(resources) {
    this[RESOURCES] = resources;
    this[ORDER] = resources.mongodb.main.collection('order');
  }

  async create(account, order) {
    //order.realIp = '183.48.47.46';
    //order.actualPrice = 1;

    let model = Object.assign({}, order, {
      accountId: account._id,
      status: common.enum.orderStatus.CreateOrder,
    });

    await this[ORDER].insertOne(model);

    let payInfo = await this[RESOURCES].service.wechatPay.unifiedOrder({
      realIp: model.realIp,
      orderId: model._id,
      actualPrice: model.actualPrice,
      openId: account.openid,
    });
    let updater = { payInfo, status: common.enum.orderStatus.UnifiedOrder };

    let result = await this[ORDER].findOneAndUpdate({_id: model._id}, {$set: updater}, {returnOriginal: false});

    return result.value;
  }

  async userPayed(orderId, accountId) {
    let selector = {
      orderId,
      accountId,
      status: common.enum.orderStatus.UnifiedOrder,
    };
    let updater = {$set: {status: common.enum.orderStatus.CompletePayment}};
    let result = await this[ORDER].findOneAndUpdate(selector, updater, {returnOriginal: false});
    return result.value ? result.value.status : 0;
  }

  async getById(orderId) {
    let order = await this[ORDER].find({_id: orderId}).next();
    if (order.payResults && order.payResults.length) {
      order.payResult = order.payResults.reverse()[0];
      delete order.payResults;
    }
    return order;
  }

  async queryByAccountId(accountId) {
    return await this[ORDER].find({accountId}).sort({_id: -1}).toArray();
  }

  async completePayment(orderId, xmlBody) {

    let selector = {
      _id: orderId,
      status: {
        $in: [
          common.enum.orderStatus.UnifiedOrder,
          common.enum.orderStatus.CompletePayment,
        ],
      },
    };

    let updater = {
      $set: {
        status: common.enum.orderStatus.ConfirmPayment,
      },
    };

    await this[ORDER].findOneAndUpdate(selector, updater, {returnOriginal: false});

    let result = await this[ORDER].findOneAndUpdate({_id: orderId}, {
      $push: {
        payResults: xmlBody,
      },
    }, {returnOriginal: false});

    return result.value;
  }
}

module.exports = OrderModel;