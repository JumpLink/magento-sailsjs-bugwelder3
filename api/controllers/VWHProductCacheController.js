/**
 * VWHProductCacheController
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

  find: function (req, res, next) {
    if (req.params['id'])
      req.params['id'] = parseInt(req.params['id']);
    if(req.query.id)
      req.params.id = parseInt(req.params.id);
    SailsService.Controller.find(sails)(req, res, next);
  }

  , import: function (req, res, next) {
    VWHProductCacheService.import(function (error, result) {
      sails.log.info("VWHProductCacheController.import done!");
      if(error) { sails.log.error(error); next(error); }
      else { res.json(result); }
    });
  }

  , unused: function (req, res, next) {
    sails.controllers.vwhproduct.unusedCache(req, res, next);
  }

  , destroyUnused: function (req, res, next) {
    sails.controllers.vwhproduct.destroyUnusedCache(req, res, next);
  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to VWHProductCacheController)
   */
  , _config: {}

  
};
