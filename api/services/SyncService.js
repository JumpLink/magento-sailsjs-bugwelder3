
exports.sync = function(options, cb) {

  console.log("SyncService: "+options);

  switch(options.model.toLowerCase()) {
    case "productcache":
      sails.log.debug("start to sync products..");
      Product.find().where().done(function(err, appl) {
        if (err) {
          sails.log.error(err);
          cb(err, null);
          return 
        }else{
          sails.log.debug(appl);
          cb(null, appl);
        }
      });

    break;
  }
};

