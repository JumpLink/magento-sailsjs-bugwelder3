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

  exportToCache: function (req, res) {
    console.log("ProductController exportToCache: "+req+" "+res);
    SyncService.sync({model:"ProductCache"}, function (err, result) {
      if(err) {
        return res.json(err, 500);
      } else {
        return res.json(result);
      }
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
