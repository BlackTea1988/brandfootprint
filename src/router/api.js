const Router = require('koa-router');

class Api {
  constructor(controllers) {
    const router = new Router();

    // 旧版接口
    // router.get('/auth/js', controllers.user.js);
    router.post('/account/signin', controllers.account.signIn);
    router.put('/account/wechat', controllers.account.setWeChatInfo);

    router.param('addressId', controllers.address.paramsAddressId);
    router.get('/address/region', controllers.address.region);
    router.post('/address/query', controllers.account.mVerifySignIn, controllers.address.query);
    router.get('/address/:addressId', controllers.account.mVerifySignIn, controllers.address.getById);
    router.post('/address', controllers.account.mVerifySignIn, controllers.address.create);
    router.put('/address/:addressId', controllers.account.mVerifySignIn, controllers.address.update);
    router.delete('/address/:addressId', controllers.account.mVerifySignIn, controllers.address.removeById);


    router.param('orderId', controllers.order.paramsOrderId);
    router.post('/order', controllers.account.mVerifySignIn, controllers.order.create);
    router.get('/order/:orderId', controllers.account.mVerifySignIn, controllers.order.getById);
    router.post('/order/mine', controllers.account.mVerifySignIn, controllers.order.queryByAccountId);

    router.all('/notice/pay/wechat', controllers.order.notice);

    this.__router__ = router;
  }

  routes() {
    return this.__router__.routes();
  }
}

module.exports = Api;