/**
 *  @param app The express app.
 *  @param config An object containing a config
 */

var moment = require('moment');

function toUUID(input) {
  // ee25 6059 - 9d92 - 4774 - 9db2 - 4563 78e0 4586
  return input.slice(0,8)   + "-" + 
         input.slice(8,12)  + "-" + 
         input.slice(12,16) + "-" + 
         input.slice(16,20) + "-" + 
         input.slice(20,32);
}

module.exports = function (DB) {

return function(app, config)
  {
    var r = require('rethinkdb');

    var serverSpine = {
      'config': config,
      'operationAllowed': function(data, request) {
        return new Promise(function(fulfill, reject){
          if (!request.session && !request.session.uid)
            reject("no session");

          var uid = request.session.uid;

          var group, groupUUID; 
          if (data.s)
            group = Object.getOwnPropertyNames(data.s)[0];
          else
            group = data.c;

          groupUUID = toUUID(group);

          DB.Groups.getGroupForUser(uid).then( function(groupData) {
            if (groupData.id != groupUUID)
              reject("group mismatch");
          })
          /*
          .then( function(){
            var task;
            if (data.s) task = Object.getOwnPropertyNames(data.s[group])[0];
            else        task = data.d;
            task = toUUID(task);

            return {id: task};
          })
          .then(DB.Exercises.getById)
          .then( function(exercise) {
            var dueDateReached = moment(exercise.dueDate).isBefore();

            if (dueDateReached && data.a != 'bs')
              reject("due date reached");
          })*/
          .then(function(){
            fulfill();
          }).catch(function(error){
              console.log("operationAllowed: ", error);
              reject("error");
            });
        });
      },
      'log': function (obj) {
        if (config.development)
          console.log('(share-ace) ' + obj);
        },
      'path': "/api/ws"
    };


    var shareJSServer = require('./core/sharejs-server')(serverSpine, app);
    var socketHandler = require('./core/socket-handler')(serverSpine);

    //shareJSServer.listen(config.sharejs.port);
    console.log('sharejs server listens now on ' + serverSpine.path)
}

}