module.exports = function (Range, a, b, config) {
  var sharejs = require('share/lib/client/index.js');
  var attach = require('../share-ace.js');
  var getStatus;

  var group = a.split("-").join("");
  var task  = b.split("-").join("");

  function connectDoc(editor){
    var host = window.location.host.toString();
    var path = 'ws://'+host+'/api/ws';
    if(process.env.NODE_ENV=="production"){
      var path = 'wss://'+host+'/api/ws';
    }
    var ws = new WebSocket(path);
    var sjs, doc, sjsclose;
    // besser nur einen ws für alle editoren

    ws.onerror = function (e) {
      console.log("websocket error! for editor " + editor);
    }

    var onclose = function (reason) {
      sjsclose(reason);
      console.log("reconnecting to ws");

      retryReconnect = function() {
        var ws = new WebSocket(path);
        sjs.bindToSocket(ws);
        ws.onclose = onclose;
      }
      setTimeout(retryReconnect, 5000);
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

    getStatus = function(){
        return {state : sjs.state, pending: doc.pendingData.length};
    };

    return getStatus;
  };

  return {connect : connectDoc, status : getStatus};
}
