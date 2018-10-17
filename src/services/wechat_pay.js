const util = require('util');
const xml = require('xml');
const xml2js = require('xml2js');
const moment = require('moment');
const lib = require('../lib');
const common = require('../common');
const configs = require('../configs');

const parseStringAsync = util.promisify(xml2js.parseString).bind(xml2js);

const INFO = Symbol('INFO');
class WeChatPay extends lib.BaseApiService {
  /**
   *
   * @param info.openId           [string]    微信登录用户编号
   * @param info.orderId          [ObjectId]  订单编号(orderId)
   * @param info.actualPrice      [number]    订单总金额，单位为分
   * @param info.realIp           [string]    APP和网页支付提交用户端ip，Native支付填调用微信支付API的机器IP
   * @returns {Promise<*>}
   */
  async unifiedOrder(info) {
    let model = Object.assign({}, {
      body: '食品',
      appid: configs.account.wechat.AppID,
      mch_id: configs.account.wechatPay.MchId,
      nonce_str: Date.now().toString(16),
      time_expire: moment().add(1, 'hour').format('YYYYMMDDHHmmss'),
      notify_url: configs.account.wechatPay.NotifyUrl,
      trade_type: 'JSAPI',
      // 以下为业务参数
      openid: `${info.openId}`,
      out_trade_no: `${info.orderId}`,
      total_fee: 1, //info.actualPrice, // todo: 这是测试的，正式需要改掉 
      spbill_create_ip: info.realIp,
    });

    let xmlResult = await this.request({
      method: 'POST',
      url: '/pay/unifiedorder',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: toXmlDataWithSign(model, configs.account.wechatPay.Secret),
    });

    let result = await parseStringAsync(xmlResult, {explicitArray: false});

    let expectSign = common.wechat.buildSign(result.xml, configs.account.wechatPay.Secret);
    if (result.xml.sign !== expectSign) throw new Error('微信小程序下单接口返回数据签名错误');

    let appParams = {
      appId: configs.account.wechat.AppID,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: Date.now().toString(16),
      package: `prepay_id=${result.xml.prepay_id}`,
      signType: 'MD5',
    };
    appParams.paySign = common.wechat.buildSign(appParams, configs.account.wechatPay.Secret);

    delete appParams.appId;
    return appParams;
  }
}

module.exports = WeChatPay;

function toXmlDataWithSign(source, appKey) {
  let keyList = Object.keys(source)
    .map(key => buildObject(key, source[key]))
    .concat([buildObject('sign', common.wechat.buildSign(source, appKey))]);

  return xml({xml: keyList});

  function buildObject(key, val) {
    let obj = {};
    obj[key] = val;
    return obj;
  }
}