const crypto = require('crypto');
const mongodb = require('mongodb');

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
}