
module.exports = function (Range, a, b) {

  function connectDoc(editor){

    var host = window.location.host.toString().split(":");

    var ws = new WebSocket('ws://'+host[0]+':8015');
    var sharejs = require('share');
    var sjs = new sharejs.Connection(ws);

    var doc = sjs.get(a, b);

    doc.subscribe();
    doc.whenReady(function () {
      setTimeout(function () {
        if (!doc.type) doc.create('text');
        if (doc.type && doc.type.name === 'text') {
          doc.attachAce(Range, editor);
        }
      });
    });
  };

  return connectDoc;
}
