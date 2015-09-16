module.exports = function (spine)
{
  var sharejs = require('share');
  var Duplex = require('stream').Duplex;
  var backend = require('./livedb-client')(spine.config);
  var share = sharejs.server.createClient({
    backend: backend
  });

  // Handle socket connections
  var socketConnectionHandler = function (client) {
    var request = client.upgradeReq;
    console.log("socketConnectionHandler request session:", request.session);

    var stream = new Duplex({
      objectMode: true
    });

    // Send new message to all clients
    stream._write = function (chunk, encoding, callback) {
      console.log('Stream : write -> ', JSON.stringify(chunk));
      client.send(JSON.stringify(chunk));
      return callback();
    };

    stream._read = function () {};

    stream.headers = client.upgradeReq.headers;

    stream.remoteAddress = client.upgradeReq.connection.remoteAddress;

    var remoteEndpoint = stream.remoteAddress + ':' + client._socket.remotePort;

    stream.on('error', function (msg) {
      spine.log('an error occured for ' + remoteEndpoint);
      return client.close(msg);
    });

    // When server receives message from the client
    client.on('message', function (data) {
      var dat = JSON.parse(data);
      var check = spine.operationAllowed(dat);
      console.log('message');
      if (!check.allowed) {
        spine.log('unpermitted operation by ' + remoteEndpoint);
        if (check.terminateSession)
          return client.close();
      }
      return stream.push(dat);
    });

    client.on('close', function (reason) {
      spine.log('closed connection to ' + remoteEndpoint + ' with reason ' + reason);
      stream.push(null);
      stream.emit('close');
      return client.close(reason);
    });

    stream.on('end', function () {
      return client.close();
    });

    return share.listen(stream);
  };

  return socketConnectionHandler;
}
