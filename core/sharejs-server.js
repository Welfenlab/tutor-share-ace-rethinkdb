
module.exports = function (spine, app)
{
  var useWsExpress = false;
  if (useWsExpress) {
      var expressWs = require('express-ws')(app, app.server);

      if ( !app.server )
        console.error("no server defined!");

      app.ws(spine.path, function(wss, req, next) {
        spine.req = req;
        var socketConnectionHandler = require('./socket-handler')(spine);
        //FIXME: seasion data is available here, but the connectionHandler dosent work this way
        socketConnectionHandler(wss);
        next();
      });

      return app.server;
  }

  var verifyClient = function(info) {
    //FIXME: no seasion data is available here?! parse cookies?
    if (!info.req.headers.cookie) {
      console.log(info.req.headers.cookie);
      return false
    }
    console.log('verifyClient cookies: ', info.req.headers.cookie);
    info.req.session = info.req.session || "set via verifyClient!!!";
    return true;
  }

  var connect = require('connect'),
    http = require('http'),
    shareJSapp = connect(),
    shareJSServer = http.createServer(shareJSapp),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
      server: app.server,
      path: spine.path,
      verifyClient: verifyClient
    });

  var socketConnectionHandler = require('./socket-handler')(spine);

  // Listen for socket connections
  wss.on('connection', socketConnectionHandler);

  return shareJSServer;
}
