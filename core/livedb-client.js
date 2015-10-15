module.exports = function (config)
{
  var Promise = require('bluebird');

  if (!config.sharejs.rethinkdb) {
	console.log("Warning using the livedb inmemory store and NOT RethinkDB!");
	var livedb = require('livedb');
	var db = livedb.memory();
	var backend = Promise.promisifyAll(livedb.client(db));
  	return backend;
  }
  // Connect to our RethinkDB database
  var db = require('livedb-rethinkdb')(config.sharejs.rethinkdb);
  var livedb = require('livedb');
  var backend = Promise.promisifyAll(livedb.client(db));

  return backend;
}
