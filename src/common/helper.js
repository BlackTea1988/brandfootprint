const crypto = require('crypto');
const mongodb = require('mongodb');
const bunyan = require('bunyan');

module.exports = {
  ObjectID: mongodb.ObjectID,
  modifyId(model) {
    return Object.assign({}, model, {
      _id: undefined,
      id: model._id,
    })
  },
  md5(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  },
  createLogger(options) {
    return bunyan.createLogger(Object.assign({
      src: true,
    }, options, {
      serializers: {
        err: bunyan.stdSerializers.err,
      },
    }));
  },
}