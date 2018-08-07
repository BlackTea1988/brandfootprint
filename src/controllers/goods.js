const moment = require('moment');
const createError = require('http-errors');
const common = require('../common');

class GoodController {
  paramsGoodId(goodId, ctx, next) {
    try {
      ctx.params.goodId = new common.helper.ObjectID(goodId);
      return next();
    } catch (e) {
      throw new createError.BadRequest('无效地址编号');
    }
  }

  async index(ctx, next) {
    let [goods] = await Promise.all([
      ctx.models.good.query(),
    ]);
    ctx.body = {goods};
  }
}

module.exports = GoodController;