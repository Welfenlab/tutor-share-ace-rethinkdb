module.exports = function (spine, app)
{
  var expressWs = require('express-ws')(app, app.server);

  if ( !app.server )
    console.error("no server defined!");

  app.ws('/ws', function(wss, req) {
    spine.req = req;
    var socketConnectionHandler = require('./socket-handler')(spine);
    socketConnectionHandler(wss);
    next();
  });

  console.log('sharejs accepts now data on /ws via websockets')

  return app.server;
}
