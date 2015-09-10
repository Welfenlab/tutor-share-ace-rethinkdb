/**
 *  @param app The express app.
 *  @param config An object containing a config
 */
module.exports = function(app, config)
  {
    var r = require('rethinkdb');

    var serverSpine = {
      'config': config,
      'operationAllowed': function(dat) {
        // add check here!
        return {
          allowed: true,
          terminateSession: true
        };
      },
      'log': function (obj) {
        if (config.development)
          console.log('(share-ace) ' + obj);
        }
    };


    var shareJSServer = require('./core/sharejs-express-ws-server')(serverSpine, app);
    var socketHandler = require('./core/socket-handler')(serverSpine);
}
