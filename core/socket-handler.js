module.exports = function (spine) {
  var sharejs = require('share')
  var Duplex = require('stream').Duplex
  var backend = require('./livedb-client')(spine.config)
  var share = sharejs.server.createClient({
    backend: backend
  })

  // Handle socket connections
  var socketConnectionHandler = function (client) {
    var stream = new Duplex({
      objectMode: true
    })

    // Send new message to all clients
    stream._write = function (chunk, encoding, callback) {
      spine.log('Stream : write | UID' + client.upgradeReq.session.uid + 'sessionID' + client.upgradeReq.sessionID + 'data' + JSON.stringify(chunk))
      client.send(JSON.stringify(chunk))
      return callback()
    }

    stream._read = function () {}

    var request = client.upgradeReq
    stream.headers = request.headers
    stream.remoteAddress = request.connection.remoteAddress

    var remoteEndpoint = stream.remoteAddress + ':' + client._socket.remotePort

    stream.on('error', function (msg) {
      spine.log('an error occured for ' + remoteEndpoint)
      return client.close(msg)
    })

    // When server receives message from the client
    client.on('message', function (data) {
      try {
        var dat = JSON.parse(data)
      } catch (e) {
        // eg failed to parse the data
        spine.log('ws message parse error: ' + e)
        this.emit('end')
      }

      spine.operationAllowed(dat, request).then(function (check) {
        spine.log('recieved message')
      }).then(function () {
        return stream.push(dat)
      }).catch(function (err) {
        spine.log('unpermitted operation by ' + remoteEndpoint + ' with reason ' + err)
        return client.close()
      })
    })

    client.on('close', function (reason) {
      spine.log('closed connection to ' + remoteEndpoint + ' with reason ' + reason)
      stream.push(null)
      stream.emit('close')
      return client.close(reason)
    })

    stream.on('end', function () {
      return client.close()
    })

    return share.listen(stream)
  }

  return socketConnectionHandler
}
