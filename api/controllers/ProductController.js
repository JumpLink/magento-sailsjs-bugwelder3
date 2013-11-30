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

  exportOneToCache: function (req, res) {
    async.waterfall([
      function find_product (callback) {
        Product.findOne(req.params.id, function product_found (err, product_info) {
          if (err) {
            sails.log.error(err);
            callback(err);
          }else{
            callback(null, product_info);
          }
        });
      },
      function import_product (product_info, callback){
        sails.log.info(product_info);
        sails.log.info("product getted");
        ProductCache.update(product_info.product_id, product_info, function product_updated (err, updated) {
          if (err) {
            sails.log.error(err);
            callback(err);
          }else{
            callback(null, updated);
          }
        });
      },
      function(updated, callback){
        sails.log.info("product updated");
        callback(null, updated);
      }
    ], function (err, result) {
      if (err) {
        res.json(err, 500);
      } else {
        res.json(result);
      }
    });
  },

  exportToCache: function (req, res) {
    console.log("ProductController exportToCache: "+req+" "+res);
    async.waterfall([
      // get product list with less informations, just with with id, sku, name, ..
      function get_product_list (callback){
        Product.find().where().done(function product_list_getted (err, product_list) {
          if (err) {
            sails.log.error(err);
            callback(err);
          }else{
            callback(null, product_list);
          }
        });
      },
      function process_each_product_id (product_list, callback){
        async.map(product_list, function iterator (item, callback) {
          sails.log.debug(item);
          ProductController.exportOneToCache(item.product_id);
        }, callback);
      },
      function(imported_products, callback){
          // arg1 now equals 'three'
          callback(null, imported_products);
      }
    ], function (err, result) {
      res.json(result);
    });
  },

  generateAttributes: function (req, res) {
    ProductModelAttributesGeneratorService.generator.product(function (err, attributes) {
      fs.writeFile("./api/models/ProductAttributes.json", JSON.stringify(attributes, null, 4), function(err) {
        if(err) {
          return res.json(err, 500);
        } else {
          sails.log.info("./api/models/ProductAttributes.json saved.");
          return res.json(attributes);
        }
      }); 
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ProductController)
   */
  _config: {}

  
};
