const moment = require('moment');
const createError = require('http-errors');
const common = require('../common');

class WeChatController {

  async comMessage(ctx, next) {
    const {msg_signature, timestamp, nonce, echostr} = ctx.query;

    let expected = common.wechat.crypto.enterprise.getSignature({timestamp, nonce, echostr});

    if (expected !== msg_signature)
      throw new createError.Unauthorized('无效签名');

    let model = common.wechat.crypto.enterprise.decrypt(echostr);

    ctx.body = model.message;
  }
}

module.exports = WeChatController;
