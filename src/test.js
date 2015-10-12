module.exports = function (Range, a, b, config) {
  var sharejs = require('share/lib/client/index.js');
  var attach = require('../share-ace.js');
  var getStatus, disconnectDoc;
  var isClosing;

  var group = a.split("-").join("");
  var task  = b.split("-").join("");

  var connectDoc = function (editor) {
    isClosing = false;
    var host = window.location.host.toString();
    var path = 'ws://'+host+'/api/ws';
    if(window.location.protocol.indexOf("https") == 0){
      path = 'wss://'+host+'/api/ws';
    }
    var ws = new WebSocket(path);
    var sjs, doc, sjsclose;
    // besser nur einen ws für alle editoren

    ws.onerror = function (e) {
      console.log("websocket error! for editor " + editor);
    }

    var onclose = function (reason) {
      sjsclose(reason);

      var retryReconnect = function() {
        ws = new WebSocket(path);
        sjs.bindToSocket(ws);
        ws.onclose = onclose;
      }

      if (!isClosing) {
        console.log("reconnecting to ws");
        setTimeout(retryReconnect, 5000);
      }
    }

    ws.onopen = function () {
      console.log("websocket connected");

      sjs = new sharejs.Connection(ws);

      sjsclose = ws.onclose;
      ws.onclose = onclose;

      doc = sjs.get(group, task);

      doc.subscribe();
      doc.whenReady(function () {
        setTimeout(function () {
          if (!doc.type) doc.create('text');
          if (doc.type && doc.type.name === 'text') {
            //doc.attachAce(Range, editor);
            attach(Range, editor, doc.createContext())
          }
        });
      });
    }

    getStatus = function() {
      return {state : sjs.state, pending: doc.pendingData.length};
    };

    disconnectDoc = function() {
      isClosing = true;
      ws.close();
    };

    return getStatus;
  };

  return {
    connect: connectDoc,
    status: getStatus,
    disconnect: disconnectDoc
  };
}
