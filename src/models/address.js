const mongodb = require('mongodb');
const createError = require('http-errors');
const configs = require('../configs');
const common = require('../common');

const RESOURCES = Symbol('resources');
const ADDRESS = Symbol('coll_address');
class AddressModel {
  constructor(resources) {
    this[RESOURCES] = resources;
    this[ADDRESS] = resources.mongodb.main.collection('address');
  }

  async initialize() {
    // await this[ADDRESS].createIndexes([
    //   {key: {openid: 1}, name: 'openid_1', background: true, unique: true},
    // ]);
  }

  async getById(addressId) {
    return await this[ADDRESS].find({_id: addressId}).next();
  }

  async create(address) {
    let model = verifyAddressBase(address);
    await this[ADDRESS].insertOne(model);
    return model;
  }

  async update(addressId, address) {
    let selector = {};
    let model = verifyAddressBase(address);
    try {
      selector._id = new mongodb.ObjectID(addressId);
      selector.accountId = address.accountId
    } catch (e) {
      throw new createError.NotFound('找不到收货地址');
    }

    let result = await this[ADDRESS].findOneAndUpdate(selector, {$set: model});

    if (!result.value) throw new createError.NotFound('找不到收货地址');

    return result.value;
  }

  async deleteOne(selector) {
    await this[ADDRESS].deleteOne(selector);
  }

  async query(selector) {
    return await this[ADDRESS].find(selector).sort({_id: -1}).toArray();
  }
}

function verifyAddressBase(address) {
  let model = {
    accountId: address.accountId,
    username: address.username,
    mobile: `${address.mobile}`,
    full_region: address.full_region,
    address: address.address,
    is_default: !!address.is_default,
  };

  if (!(model.accountId instanceof mongodb.ObjectID))
    throw new createError.BadRequest('无效用户');

  if (!model.username)
    throw new createError.BadRequest('请输入姓名');

  if (!/^1\d{10}$/.test(model.mobile))
    throw new createError.BadRequest('请输入正确手机号');

  if (!model.full_region || !model.address)
    throw new createError.BadRequest('请输入收货地址');

  return model;
}

module.exports = AddressModel;