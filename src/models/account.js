const mongodb = require('mongodb');
const createError = require('http-errors');
const configs = require('../configs');
const common = require('../common');


const RESOURCES = Symbol('resources');
const ACCOUNT = Symbol('coll_account');
class AccountModel {
  constructor(resources) {
    this[RESOURCES] = resources;
    this[ACCOUNT] = resources.mongodb.main.collection('account');
  }

  async initialize() {
    await this[ACCOUNT].createIndexes([
      {key: {openid: 1}, name: 'openid_1', background: true, unique: true},
      {key: {unionid: 1}, name: 'unionid_1', background: true, sparse: true},
    ]);
  }

  async getById(accountId) {
    try {
      let id = new mongodb.ObjectID(accountId);
      return await this[ACCOUNT].find({_id: id}).next();
    } catch (e) {
      return null;
    }
  }

  async signInByWeChat(code) {
    let {openid, session_key, unionid} = await this[RESOURCES].service.wechat.snsJsCode2Session(code);
    if (!openid || !session_key) throw new Error('微信登录失败');

    let selector = {openid};
    let updater = {
      $set: {unionid, session_key},
      $setOnInsert: {token: (new mongodb.ObjectID()).toString()},
    };
    let options = {upsert: true, returnOriginal: false};

    let result = await this[ACCOUNT].findOneAndUpdate(selector, updater, options);

    return result.value;
  }

  async setWeChatInfo(account, info) {
    const pc = new common.WXBizDataCrypt(configs.account.wechat.AppID, account.session_key);
    let {encryptedData, iv} = info;
    let data = pc.decryptData(encryptedData, iv);

    let selector = {_id: account._id};
    let updater = {$set: {wechat: data},};
    let options = {upsert: true, returnOriginal: false};

    let result = await this[ACCOUNT].findOneAndUpdate(selector, updater, options);

    return result.value;
  }
}

module.exports = AccountModel;
