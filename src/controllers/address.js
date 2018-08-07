const moment = require('moment');
const createError = require('http-errors');
const common = require('../common');

class AddressController {
  paramsAddressId(addressId, ctx, next) {
    try {
      ctx.params.addressId = new common.helper.ObjectID(addressId);
      return next();
    } catch (e) {
      throw new createError.BadRequest('无效地址编号');
    }
  }
  async region(ctx, enxt) {
    ctx.body = common.region;
  }
  async getById(ctx, next) {
    let address = await ctx.models.address.getById(ctx.params.addressId);
    ctx.body = common.helper.modifyId(address);
  }
  async create(ctx, next) {
    const {account} = ctx.state;
    if (!account) throw new createError.Unauthorized('无效用户');

    let body = Object.assign({}, ctx.request.body, {_id: undefined, accountId: account._id});

    ctx.status = 201;
    let address = await ctx.models.address.create(body);
    ctx.body = common.helper.modifyId(address);
  }
  async update(ctx, next) {
    const {account} = ctx.state;
    if (!account) throw new createError.Unauthorized('无效用户');

    let body = Object.assign({}, ctx.request.body, {_id: undefined, accountId: account._id});

    let address = await ctx.models.address.update(ctx.params.addressId, body);
    ctx.body = common.helper.modifyId(address);
  }
  async removeById(ctx, next) {
    const {account} = ctx.state;
    if (!account) throw new createError.Unauthorized('无效用户');

    await ctx.models.address.deleteOne({
      _id: ctx.params.addressId,
      accountId: account._id,
    });
    ctx.status = 200;
  }
  async query(ctx, next) {
    const {account} = ctx.state;
    if (!account) throw new createError.Unauthorized('无效用户');

    let items = await ctx.models.address.query({accountId: account._id});

    ctx.body = {items: items.map(common.helper.modifyId)};
  }
}

module.exports = AddressController;