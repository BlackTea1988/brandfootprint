const querystring = require('querystring');
const moment = require('moment');
const createError = require('http-errors');


class AccountController {
  async mVerifySignIn(ctx, next) {
    let aid = ctx.cookies.get('aid');
    let atk = ctx.cookies.get('atk');

    let account = await ctx.models.account.getById(aid);

    if (account && account.token === atk)
      ctx.state.account = account;

    await next();
  }
  async signIn(ctx, next) {
    let {code, result} = ctx.request.body;

    let account = await ctx.models.account.signInByWeChat(code, result);

    setAccountCookies(ctx, account);
    ctx.body = {
      id: account._id,
      wechat: {nickName: account.wechat.nickName},
    };
  }
}

function setAccountCookies(ctx, account = {}) {
  const regex = /vipc\.(cn|me)$/;
  const matches = ctx.host.match(regex);
  const domain = matches ? `vipc.${matches[1]}`: null;
  const expires = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  ctx.cookies.set('aid', account._id, { domain, expires, httpOnly: false, overwrite: true });
  ctx.cookies.set('atk', account.token, { domain, expires, httpOnly: true, overwrite: true });

  ctx.set({'SET-WECHAT-COOKIE': querystring.stringify({aid: account._id.toString(), atk: account.token}, '; ')});
}

module.exports = AccountController;