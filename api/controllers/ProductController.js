/**
 * ProductController
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

var fs = require('fs');

module.exports = {

  exportOneToCache : function (req, res, next) {
    ProductService.exportOneToCacheByID(req.params.id, function exportOneToCacheDone (error, result) {
      if (error) {
        sails.log.error(error);
        return next(error);
      } else {
        return res.json(result);
      }
    });
  },

  exportToCache: function (req, res, next) {
    ProductService.exportToCache(function (error, result) {
      if (error) {
        sails.log.error(error);
        return next(error);
        //return res.json(error, 500);
      } else {
        return res.json(result);
      }
    });
  },

  generateAttributes: function (req, res, next) {
    ProductAttributeService.generate(function (error, result) {
      if(error) {
        sails.log.error(error);
        return next(error);
        //return res.json(error, 500);
      } else {
        return res.json(result);
      }
    });
  },

  saveAttributes: function (req, res, next) {
    ProductAttributeService.generateAndSaveToFile(function (error, result) {
      if(error) {
        sails.log.error(error);
        return next(error);
        //return res.json(error, 500);
      } else {
        return res.json(result);
      }
    });
  },

  repair: function (req, res, next) {
    ProductService.repair(function (error, result) {
      if(error) {
        sails.log.error(error);
        return next(error);
        //return res.json(error, 500);
      } else {
        return res.json(result);
      }
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ProductController)
   */
  _config: {}

  
};
