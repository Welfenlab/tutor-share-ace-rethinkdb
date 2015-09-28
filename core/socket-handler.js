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
    var stream = new Duplex({
      objectMode: true
    });

    // Send new message to all clients
    stream._write = function (chunk, encoding, callback) {
      console.log('Stream : write | UID', client.upgradeReq.session.uid, "sessionID", client.upgradeReq.sessionID, "data" , JSON.stringify(chunk));
      client.send(JSON.stringify(chunk));
      return callback();
    };

    stream._read = function () {};

    var request = client.upgradeReq;
    stream.headers = request.headers;
    stream.remoteAddress = request.connection.remoteAddress;

    var remoteEndpoint = stream.remoteAddress + ':' + client._socket.remotePort;

    stream.on('error', function (msg) {
      spine.log('an error occured for ' + remoteEndpoint);
      return client.close(msg);
    });

    // When server receives message from the client
    client.on('message', function (data) {
      try {
        var dat = JSON.parse(data);
        var check = spine.operationAllowed(dat, request);
        console.log('recieved message');
        if (!check.allowed) {
          spine.log('unpermitted operation by ' + remoteEndpoint);
          if (check.terminateSession)
            return client.close();
        }
        return stream.push(dat);
      } catch (e) {
        //eg failed to parse the data
        console.log(e);
        this.emit('end');
      }
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
