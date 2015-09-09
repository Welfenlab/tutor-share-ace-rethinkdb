module.exports = function (config)
{
  var Promise = require('bluebird');
  // Connect to our RethinkDB database
  var db = require('livedb-rethinkdb')(config.sharejs.rethinkdb);
  var livedb = require('livedb');
  var backend = Promise.promisifyAll(livedb.client(db));

  return backend;
}
