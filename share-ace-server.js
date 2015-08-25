/**
 *  @param app The express app.
 *  @param serverSpine An object containing a config,
 *                     a 'operationAllowed' function taking one argument and
 *                     a 'log' function taking one argument for logging.
 */
module.exports = function(app, serverSpine)
{
  var r = require('rethinkdb');

  var shareJSServer = require('./core/sharejs-server')(serverSpine);
  var socketHandler = require('./core/socket-handler')(serverSpine);

  shareJSServer.listen(serverSpine.config.ports.sharejs);
}
