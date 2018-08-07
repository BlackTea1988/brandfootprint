const url = require('url');
const mongodb = require('mongodb');
const Base = require('./base');

class Mongodb extends Base {
  __buildResourcePromise(name, configure) {
    return new Promise(async (resolve, reject) => {
      let options = Object.assign({}, configure.options, {useNewUrlParser: true});
      const client = await mongodb.MongoClient.connect(configure.uri, options);
      resolve(client.db(getDBName(configure.uri)));
    });
    function getDBName(uri) {
      const pathname = url.parse(uri).pathname;
      const path = pathname.split('/');
      return path[path.length - 1];
    }
  }
}

module.exports = Mongodb;
