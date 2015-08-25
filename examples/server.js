var express = require('express');
var app = express();
var config = require('./sharejs_config');
var _ = require('lodash');

// carries behaviour and config
var serverSpine = {
  'config': config,
  'operationAllowed': function(dat) {
    return {
      allowed: true,
      terminateSession: true
    };
  },
  'log': function (obj) { console.log('(share-ace) ' + obj); }
}

app.use(express.static(__dirname));

var server = require('http').Server(app);

(require('../share-ace-server'))(app, serverSpine);

server.listen(serverSpine.config.ports.http);
