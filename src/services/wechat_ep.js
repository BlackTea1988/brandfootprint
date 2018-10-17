const lib = require('../lib');
const configs = require('../configs');

const INFO = Symbol('INFO');
class WeChatEnterprise extends lib.BaseApiService {
  async getToken() {
    return await this.request({
      url: '/cgi-bin/gettoken',
      qs: {
        corpid: configs.account.wechatEnterprise.CorpID,
        corpsecret: configs.account.wechatEnterprise.AgentSecret,
      },
    });
  }

  async sendMessage(access_token, message) {
    return await this.request({
      method: 'POST',
      url: '/cgi-bin/message/send',
      qs: {access_token},
      json: message,
    });
  }
}

module.exports = WeChatEnterprise;

