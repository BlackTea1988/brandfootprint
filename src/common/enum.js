module.exports = {
  orderStatus: {
    // 创建订单[等待支付]
    CreateOrder: 1,
    // 微信下单[等待支付]
    UnifiedOrder: 2,
    // 完成支付[等待发货]
    CompletePayment: 3,
    // 完成发货[等待收货]
    CompleteExpress: 4,
    // 完成订单[订单完成]
    AllFinish: 5,
  }
}