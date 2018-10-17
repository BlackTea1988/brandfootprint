const xml2js = require('xml2js');
const raw    = require('raw-body');

module.exports = function (options) {
  /**
   * only parse and set this.request.body when
   * 1. type is xml (text/xml and application/xml)
   * 2. method is post/put/patch
   * 3. this.request.body is undefined
   */
  options = options || {};

  return async function (ctx, next) {

    if (!ctx.is('text/xml', 'xml')) return await next();
    if (0 > ['POST', 'PUT', 'PATCH'].indexOf(ctx.method)) return await next();

    try {
      ctx.request.body = await parse(ctx.req, options);
    } catch (err) {
      // if want to throw error, set onerror to null
      if (options.onerror) {
        options.onerror(err, ctx);
      } else {
        throw err;
      }
    }
    await next();
  }
};

function convertXml2Json (str, options) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(str, options, function (err, result) {
      err ? reject(err) : resolve(result);
    });
  });
}

async function parse (request, options) {
  let len = request.headers['content-length'];
  options.length = ~~len;
  options.limit = '2mb';
  options.encoding = !options.encoding && request.charset ? request.charset:'utf8';

  let xmlOptions = Object.assign({
    explicitArray: false
  }, options.xml || {});

  let str = await raw(request, options);
  return await convertXml2Json(str, xmlOptions);
}