const lib = require('../lib');
const configs = require('../configs');

const INFO = Symbol('INFO');
class WeChat extends lib.BaseApiService {
  async snsJsCode2Session(jsCode) {
    return await this.request({
      url: '/sns/jscode2session',
      qs: {
        appid: configs.account.wechat.AppID,
        secret: configs.account.wechat.AppSecret,
        js_code: jsCode,
        grant_type: 'authorization_code',
      },
    });
  }
}

module.exports = WeChat;

