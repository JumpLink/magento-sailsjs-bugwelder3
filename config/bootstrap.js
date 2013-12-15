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
    } else {
      sails.log.info("Admin User checked");
      cb(err, result);
    }
  });  
}

var StartDNodeService = function (callback) {
  DNodeService.server().start(function StartDNodeServiceDone (json) {
    sails.log.info("DNodeService Server started");
    callback(null, json);
  });
}

var listenExternChangesForProductService = function (callback){
  ProductService.listenExternChanges(function (error, activated) {
    if(!error && activated)
      sails.log.info("listen extern changes for ProductService started");
    callback(error, activated);
  });
}

var listenExternChangesForProductCacheService = function (callback){
  ProductCacheService.listenExternChanges(function (error, activated) {
    if(!error && activated)
      sails.log.info("listen extern changes for ProductCacheService started");
    callback(error, activated);
  });
}

module.exports.bootstrap = function (final_callback) {

  async.series([
    StartDNodeService
    , createAdminUser
    , listenExternChangesForProductService
    , listenExternChangesForProductCacheService
  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  ], final_callback);

};