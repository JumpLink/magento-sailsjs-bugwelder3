
exports.sync = function(options) {

  console.log("SyncService: "+options);

  switch(options.model) {
    case "productcache":
    case "ProductCache":
    case "Productcache":
      sails.log.debug("start du sync products..");
      Product.find().where().done(function(err, appl) {
          if (err) {
            return sails.log.error(err);
          }else{
            sails.log.debug(appl);
            //console.log(sails.io);
            //MagentoEventService.server();
          }
      });

    break;
  }
};

