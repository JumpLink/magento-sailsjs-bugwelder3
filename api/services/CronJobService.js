var cronJob = require('cron').CronJob;

var ImportVWHProducts = function (callback) {
  async.series([
    function(callback) {
      Log.create({
        error: false
        , model: 'VWHProductCache'
        , service: 'CronJobService'
        , action: 'import'
        , status: 'start'
      }, callback);
    }
    // async.apply(Log.create, {
    //   error: false
    //   , model: 'VWHProductCache'
    //   , service: 'CronJobService'
    //   , action: 'import'
    //   , status: 'start'
    // })
    , VWHProductCacheService.import
    , function(callback) {
      Log.create({
        error: false
        , model: 'VWHProductCache'
        , service: 'CronJobService'
        , action: 'import'
        , status: 'done'
      }, callback);
    }
    // , async.apply(Log.create, {
    //   error: false
    //   , model: 'VWHProductCache'
    //   , service: 'CronJobService'
    //   , action: 'import'
    //   , status: 'done'
    // })
  ], function importFromSourceWithLogDone (error, results){
    if (error) {
      Log.create({ 
        error: true
        , model: 'VWHProductCache'
        , service: 'CronJobService'
        , action: 'import'
        , status: 'done'
        , value: typeof(error) === 'undefined' ? results[1] : error
        , message: "Can't import products from VWH to Cache from ChronJob"
      }, function (logerror, logresult) {
        callback(error, results[1]); // callback with importFromSourceWithLogDone results
      });
    } else {
      callback(error, results[1]);
    }
  }); 
}

var VWHSyncJob = new cronJob({
  cronTime: '0 * * * *'
  , onTick: function() {
    // Runs every hour
    Config.find({}, function (error, config) {
      config = config[0];
      if(config.vwh_sync_cronjob_on === true) {
        sails.log.info("Start VWHSyncJob");
        ImportVWHProducts(function(error, result) {
          sails.log.info("VWHSyncJob Done");
          if(error)
            sails.log.error(error);
        });
      } else {
        sails.log.info("VWHSyncJob is off, do nothing");
      }
    });
  }
  , start: false /* Start the job right now */
  , timeZone: "Europe/Berlin"
});


// run VWHSyncJob.start(); to start

module.exports = {
  VWHSyncJob : VWHSyncJob
}