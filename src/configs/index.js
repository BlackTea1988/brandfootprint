const localhost = 'localhost';

module.exports = {
  hostname: process.env.DOMAIN || '',
  port: process.env.PORT || '8080',
  account: {
    wechat: {
      AppID: process.env.WECHAT_APPID,
      AppSecret: process.env.WECHAT_APPSECRET,
    },
    wechatPay: {
      MchId: process.env.WECHATPAY_MCHID,
      Secret: process.env.WECHATPAY_SECRET,
      NotifyUrl: 'https://api-wechat.brandfootprint.cn/api/notice/pay/wechat',
    },
  },
  web: {
    resourcesRelativePath: 'public',
  },
  resource: {
    mongodb: {
      main: {
        uri: process.env.RICH_RES_MONGODB_MAIN || `mongodb://${localhost}:27017/brandfootprint`,
      },
    },
    service: {
      wechat: {
        uri: process.env.RICH_RES_SERVICE_WECHAT || 'https://api.weixin.qq.com',
        options: {timeout: 10 * 1000},
      },
      wechatPay: {
        uri: process.env.RICH_RES_SERVICE_WECHATPAY || 'https://api.mch.weixin.qq.com',
        options: {timeout: 10 * 1000},
      }
    },
  },
};

