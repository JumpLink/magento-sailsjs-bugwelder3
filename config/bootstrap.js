/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var createAdminUser = function (cb) {

  User.findOrCreate({email:"admin@admin.org", name: "admin", color: "#000000", password: "sails-admin"}, function (err, result) {
    if(err) {
      sails.log.err(err);
    }
    cb(err, result);
  });  
}

module.exports.bootstrap = function (cb) {
  DNodeService.server().start(function(json) {

    createAdminUser(function(err, result) {
      sails.log.info("admin checked");
      cb(err, result);
    });

  });


  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  //cb();
};