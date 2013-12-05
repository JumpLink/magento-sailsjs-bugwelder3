/**
 * ProductCacheController
 *
 * @module      :: Controller
 * @description	:: Product Cache saved in MongoDB
 *
 *                 This Controller is used for fast access to the Products.
 *                 Each modified Magento Product will saved in MongoDB using this Controller.
 *                 So you can use this Cache to get the current Product information
 *                 in a faster way as directly from Magento. 
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  import: function (req, res, next) {
    sails.controllers.product.exportToCache(req, res, next);
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ProductCacheController)
   */
  _config: {}

  
};
