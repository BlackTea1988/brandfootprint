const configs = require('../../configs');
const helper = require('../helper');
const WeChatEnterpriseCrypto = require('./crypto_enterprise');

module.exports = {
  buildSign(source, appKey) {
    let stringSignTemp = Object.keys(source)
      .filter(key => key !== 'sign')
      .sort()
      .map(key => [key, source[key]].join('='))
      .concat([`key=${appKey}`])
      .join('&');

    return helper.md5(stringSignTemp).toUpperCase();
  },
  crypto: {
    enterprise: new WeChatEnterpriseCrypto({
      id: configs.account.wechatEnterprise.CorpID,
      token: configs.account.wechatEnterprise.Token,
      encodingAESKey: configs.account.wechatEnterprise.EncodingAESKey,
    }),
  },
};