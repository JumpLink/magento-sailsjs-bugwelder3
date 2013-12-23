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

    
  find: function (req, res, next) {
    // ID to Integer
    if (req.params['id'])
      req.params['id'] = parseInt(req.params['id']);
    if(req.query.id)
      req.query.id = parseInt(req.query.id);

    // set to Integer NOT WORKING see https://github.com/balderdashy/sails/issues/407
    if(req.query.set)
      req.query.set = parseInt(req.query.set);

    SailsService.Controller.find(sails)(req, res, next);
  }

  , import: function (req, res, next) {
    sails.controllers.product.exportToCache(req, res, next);
  }

  , test: function (req, res, next) {
    ProductCache.findOne({id:5}, function (error, result) {
      sails.log.warn(result.toObject);
      res.json(result);
    });
  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ProductCacheController)
   */
  , _config: {}

  
};
