
var sharejs = require('share/lib/client/index.js');
var attach = require('../share-ace.js');
var EventEmitter = require('event-emitter');

module.exports = function (editor, Range, group, exercise, number, config) {
  var dconv = require('./doc_name_converter')(config);
  var getStatus;
  var isClosing = false;


  var host = window.location.host.toString();
  var path = 'ws://'+host+'/api/ws';
  if(window.location.protocol.indexOf("https") == 0){
    path = 'wss://'+host+'/api/ws';
  }
  var ws = new WebSocket(path);
  var sjs, doc, sjsclose;

  var editorConnection = {
    status: function() {
      return {
        state: sjs ? sjs.state : 'disconnected',
        pending: doc ? doc.pendingData.length : 0
      };
    },

    disconnect: function() {
      isClosing = true;
      ws.close();
    }
  };
  EventEmitter.installOn(editorConnection);

  ws.onerror = function (e) {
    console.log("websocket error! for editor " + editor);
  }

  var onclose = function (reason) {
    sjsclose(reason);
    editorConnection.trigger('disconnect', reason);

    var retryReconnect = function() {
      editorConnection.trigger('reconnecting');
      ws = new WebSocket(path);
      sjs.bindToSocket(ws);
      ws.onopen = function() {
        editorConnection.trigger('reconnect');
      };
      ws.onclose = onclose;
    }

    if (!isClosing) {
      console.log("reconnecting to ws");
      setTimeout(retryReconnect, 5000);
    }
  }

  ws.onopen = function () {
    console.log("websocket connected");
    editorConnection.trigger('connect');

    sjs = new sharejs.Connection(ws);

    sjsclose = ws.onclose;
    ws.onclose = onclose;

    var docName = dconv.group2Doc(group, exercise, number);
    doc = sjs.get(docName.a, docName.b);

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

  return editorConnection;
}
