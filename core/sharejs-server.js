

module.exports = function (spine, app)
{
    var expressWs = require('express-ws')(app, app.server);
    var socketConnectionHandler = require('./socket-handler')(spine);

    if ( !app.server )
      console.error("no server defined!");

    app.ws(spine.path, function(wss, req) {
      if(!req.session || !req.session.uid) {
        wss.send("login required");
        wss.close();
        console.log("tried to connect to ws without a session uid");
        return;
      }
      socketConnectionHandler(wss);
    });

    return app.server;
}
