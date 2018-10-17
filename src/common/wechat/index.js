const configs = require('../../configs');
const WeChatEnterpriseCrypto = require('./crypto_enterprise');

module.exports = {
  crypto: {
    enterprise: new WeChatEnterpriseCrypto({
      id: configs.account.wechatEnterprise.CorpID,
      token: configs.account.wechatEnterprise.Token,
      encodingAESKey: configs.account.wechatEnterprise.EncodingAESKey,
    }),
  },
};