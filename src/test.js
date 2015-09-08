
module.exports = function (Range, a, b) {
  var sharejs = require('share/lib/client/index.js');
  var attach = require('../examples/share-ace.js');

  function connectDoc(editor){
    var host = window.location.host.toString().split(":");
    var ws = new WebSocket('ws://'+host[0]+':8015');
    // besser nur einen ws für alle editoren

    ws.onerror = function (e) {
      console.log("websocket error! for editor " + editor);
    }

    ws.onopen = function () {
      console.log("websocket connected");

      var sjs = new sharejs.Connection(ws);

      var doc = sjs.get(a, b);

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
  };

  return {connect : connectDoc};
}
