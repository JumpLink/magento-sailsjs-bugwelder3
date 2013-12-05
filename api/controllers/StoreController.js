/**
 * StoreController
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
    sails.log.debug("StoreController exportToCache: "+req+" "+res);
    ExportToCacheService(Store, StoreCache, function (error, result) {
      if(error)
        res.json(error, 500);
      else
        res.json(result);
    });
  },

  tree: function(req, res, next) {

    Store.store_tree(function getTree(err, store_tree) {
      res.json(store_tree);
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to StoreController)
   */
  _config: {}

  
};
