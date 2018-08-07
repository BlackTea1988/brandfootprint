const mongodb = require('mongodb');
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
    order.realIp = '183.48.47.46'; // todo
    order.actualPrice = 1;

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

  async getById(orderId) {
    return await this[ORDER].find({_id: orderId}).next();
  }

  async queryByAccountId(accountId) {
    return await this[ORDER].find({accountId}).sort({_id: -1}).toArray();
  }
}

module.exports = OrderModel;