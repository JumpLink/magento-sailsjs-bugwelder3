
exports.sync = function(options) {

  console.log("SyncService: "+options);

  switch(options.model) {
    case "productcache":
    case "ProductCache":
    case "Productcache":
      ProductCache.find().where({id: 2}).done(function(err, appl) {
          if (err) {
            return console.log('HAI');
          }else{
            console.log(appl);
          }
      });

    break;
  }
};