module.exports = {
  syncCache: function (BasicController, CacheController, last_callback) {
    sails.log.debug("ExportToCacheService");
    async.waterfall([
      function destroy_all (callback) {
        CacheController.destroy(callback);
      },
      // get all attributes with all information
      function get_basic_list (destroyed, callback){
        sails.log.debug(destroyed);
        BasicController.find().where().done(function basic_getted (err, basic_list) {
          if (err) {
            sails.log.error(err);
            callback(err);
          } else {
            sails.log.debug(basic_list);
            callback(null, basic_list);
          }
        });
      },
      function process_each (basic_list, callback){
        CacheController.createEach(basic_list, callback)
      }
    ], last_callback);
  },

  importExternChangedProducts : function (old_extern_products, new_extern_products, callback) {
    for (var i = 0; i < intern_products.length; i++) {
      intern_products[i]
      for (var k = 0; k < extern_products.length; k++) {

      };
    };
  }
  
}