/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var createConfig = function (cb) {
  Config.findOrCreate({
    "listen_extern_changes_on" : false
    , "magento_product_cache_on" : false
    , "vwh_product_cache_on" : false
    , "vwh_sync_cronjob_on" : false
}, function (err, result) {
    if(err) {
      sails.log.err(err);
    } else {
      sails.log.info("Config checked");
      cb(err, result);
    }
  });  
}

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

var StartCronJobs = function (callback) {
  CronJobService.VWHSyncJob.start();
  sails.log.info("CronJobs started");
  callback(null, null);
}


module.exports.bootstrap = function (final_callback) {

  async.series([
    StartDNodeService
    , createConfig
    , createAdminUser
    , listenExternChangesForProductService
    , listenExternChangesForProductCacheService
    , StartCronJobs
  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  ], final_callback);

};