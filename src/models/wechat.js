const moment = require('moment');
const createError = require('http-errors');
const configs = require('../configs');
const common = require('../common');

const logger = common.helper.createLogger({name: 'models_wechat'});

const RESOURCES = Symbol('resources');
const TOKEN = Symbol('token');
class WeChatModel {
  constructor(resources) {
    this[RESOURCES] = resources;
  }

  async initialize() {
    // await this[ADDRESS].createIndexes([
    //   {key: {openid: 1}, name: 'openid_1', background: true, unique: true},
    // ]);
    this.__loopFlushToken()
      .catch(err => logger.error({err}, '获取企业 token 循环异常退出'));

  }

  async __loopFlushToken() {
    const oneHour = 3600 * 1000;
    const oneMinute = 60 * 1000;
    let delayMs = oneHour;
    while (true) {
      try {
        let result = await this[RESOURCES].service.wechatEP.getToken();
        if (result.errcode) throw new Error(`[${result.errcode}]${result.errmsg}`);
        this[TOKEN] = result.access_token;
        logger.info(`获取 token 成功，长度：${this[TOKEN].length}`);
      } catch (err) {
        delayMs = oneMinute;
        logger.warn({err}, `获取 token 失败，${oneMinute / 1000} 秒后重试`);
      }

      await common.helper.delay(delayMs);
    }
  }

  async epSendNotice(order) {

    let address = order.address;
    let descUrl = `https://api-wechat.brandfootprint.cn/html/order.html#${order._id}`;
    let message = [
      `新增一个等待发货的订单`,
      //`【测试】新增一个等待发货的订单`,
      `时间：${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      `用户：${address.username}`,
      `手机：${address.mobile}`,
      ``,
      `<a href="${descUrl}">点击查看详情</a>`,
    ].join('\n');

    await this[RESOURCES].service.wechatEP.sendMessage(this[TOKEN], {
      "touser" : "@all",
      "msgtype" : "text",
      "agentid" : configs.account.wechatEnterprise.AgentId,
      "text" : {
        "content" : message,
      },
      "safe":0
    });
  }
}

module.exports = WeChatModel;