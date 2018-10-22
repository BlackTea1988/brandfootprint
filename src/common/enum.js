module.exports = {
  orderStatus: {
    // 创建订单[等待支付]
    CreateOrder: 1,
    // 微信下单[等待支付]
    UnifiedOrder: 2,
    // 完成支付[完成支付]
    CompletePayment: 3,
    // 完成确认[等待发货]
    ConfirmPayment: 4,
    // 完成发货[等待收货]
    CompleteExpress: 5,
    // 完成订单[订单完成]
    AllFinish: 6,
  }
}