/**
 *  @param app The express app.
 *  @param config An object containing a config
 */
module.exports =  function(app, config)
  {
    var r = require('rethinkdb');

    var serverSpine = {
      'config': config,
      'operationAllowed': function(data, request) {
        // add check here!
        if (!request.session && !request.session.uid)
          return {
            allowed: false,
            terminateSession: true
          };
        return {
          allowed: true,
          terminateSession: true
        };
      },
      'log': function (obj) {
        if (config.development)
          console.log('(share-ace) ' + obj);
        },
      'path': "/api/ws"
    };


    var shareJSServer = require('./core/sharejs-server')(serverSpine, app);
    var socketHandler = require('./core/socket-handler')(serverSpine);

    //shareJSServer.listen(config.sharejs.port);
    console.log('sharejs server listens now on ' + serverSpine.path)
}
