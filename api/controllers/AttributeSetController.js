/**
 * AttributeSetController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  
  exportToCache: function (req, res) {
    console.log("AttributeSetController exportToCache: "+req+" "+res);
    async.waterfall([
      // get all attributes with all information
      function get_attributeset_list (callback){
        AttributeSet.find().where().done(function attributeset_getted (err, attributeset_list) {
          if (err) {
            sails.log.error(err);
            callback(err);
          }else{
            sails.log.debug(attributeset_list);
            callback(null, attributeset_list);
          }
        });
      },
      function process_each_attribute_id (attributeset_list, callback){
        AttributeSetCache.createEach(attributeset_list, callback)
      },
      function(imported_attributes, callback){
          // arg1 now equals 'three'
          callback(null, imported_attributes);
      }
    ], function (err, result) {
      if(err)
        res.json(err, 500);
      else
        res.json(result);
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AttributeSetController)
   */
  _config: {}

  
};
