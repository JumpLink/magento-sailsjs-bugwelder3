module.exports = function (BasicController, CacheController, last_callback) {
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
}