const bunyan = require('bunyan');

module.exports = {

  async delay(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  },

  createLogger(options) {
    return bunyan.createLogger(Object.assign({
      src: true,
    }, options, {
      serializers: {
        err: bunyan.stdSerializers.err,
      },
    }));
  }
};