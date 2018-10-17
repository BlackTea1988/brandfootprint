const WeChatEnterpriseCrypto = require('./crypto_enterprise');

module.exports = {
  crypto: {
    enterprise: new WeChatEnterpriseCrypto({
      id: 'ww154b45b3c1eb81e1',
      token: 'chendongniu_303',
      encodingAESKey: 'coUJLDPXEQRtdoEJNcUd7jGk9FzYHTWDKirjJ3wQinx',
    }),
  },
};