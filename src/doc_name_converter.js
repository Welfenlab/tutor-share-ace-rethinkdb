

// converts document paths to user information.
// Either uses the session information and the exercise to
// generate a valid document path, or it gets a document
// and generates the groupid and exercise from the document.

module.exports = function(config){
  DConv = {
    session2Group: function(session, DB) {
      if(!session || !session.uid){
        return Promise.reject("No session data defined");
      }
      return DB.Groups.getGroupForUser(session.uid).then(function(group){
        return group;
      });
    },
    doc2Group: function(doc){
      var partA = "", partB = "";
      if (doc.s) {
        partA = Object.getOwnPropertyNames(doc.s)[0];
        partB = Object.getOwnPropertyNames(doc.s[partA])[0];
      } else {
        partA = doc.c;
        partB = data.d;
      }
      var data = partB.split(":");
      return {group:data[0], exercise:data[1], number:data[2]};
    },
    group2Doc: function(group, exercise, number) {
      // we want to use as little tables as possible as those are
      // hard to create for RethinkDB AND it is not possible to create Shards
      // and Replicas.
      var partA = config.document;
      var partB = group+":"+exercise+":"+number
      return {a: partA, b: partB};
    }
  };
  return DConv;
};
