/**
 * VWHProductController
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

  unusedCache: function (req, res, next) {
    VWHProductService.getUnusedProducts(function(error, result) {
      if(error) { sails.log.error(error); next(error); }
      else { res.json(result); }
    });
  },

  destroyUnusedCache: function (req, res, next) {
    VWHProductService.destroyUnusedProducts(function (error, result) {
      sails.log.info("VWHProductService.destroyUnusedCache done!");
      if(error) { sails.log.error(error); next(error); }
      else { res.json(result); }
    });
  },
    
  exportToCache: function (req, res, next) {
    VWHProductService.exportToCache (function (error, result) {
      sails.log.info("VWHProductService.exportToCache done!");
      if(error) { sails.log.error(error); next(error); }
      else { res.json(result); }
    });
  },

  /**
   * Get all products with all informations.
   */
  infos: function (req, res, next) {
    VWHProduct.infos(function (error, result) {
      sails.log.info("VWHProduct.infos done!");
      if(error) { sails.log.error(error); next(error); }
      else res.json(result);
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to VWHProductController)
   */
  _config: {}

  
};
