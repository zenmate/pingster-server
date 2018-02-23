const mongojs = require('mongojs');
const { mongodb } = require('c0nfig');

const db = mongojs(mongodb.url);
const collection = db.collection(mongodb.collection);

function get () {
  return new Promise((resolve, reject) => {
    collection.findOne((err, doc) => {
      if (err) {
        return reject(err);
      }

      delete doc._id;

      resolve(doc);
    });
  });
}

function set (obj = {}) {
  collection.findOne((err, doc) => {
    if (doc) {
      collection.update({_id: doc._id}, obj);
    } else {
      collection.insert(obj);
    }
  });
}

module.exports = { get, set };
