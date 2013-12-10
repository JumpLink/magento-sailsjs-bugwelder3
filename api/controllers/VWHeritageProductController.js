/**
 * VWHeritageProductController
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

var _ = require('underscore');

/**
 * Check if product exists in product list.
 * Use "attribute_name" to specify the attribute to check equal.
 */
var productExists = function (product, productList, attribute_name) {
  for (var i = 0; i < productList.length; i++) {
    if(productList[i][attribute_name] == product[attribute_name])
      return true;
  };
  return false;
}

/**
 * Get Products in a but not in b
 */
var getDifference = function (a, b, callback) {
  async.filter(
    a
    , function iterator (item, iterator_callback) {
      var exists = productExists(item, b, 'id');
      iterator_callback(!exists);
    }
    , callback
  );
}

/**
 * Get changes of new product by old product 
 */
var getChanges = function (new_product, old_product) {
  var result = {
    id: old_product.id,
    has_changes : false,
    changes : {}
  };
  for (var attribute in new_product) {
    if(attribute != 'id' && !_.isEqual(new_product[attribute], old_product[attribute]) ) {
      result.changes[attribute] = new_product[attribute];
      result.has_changes = true;
    }
  }
  return result;
}

/**
 * Update Product, if this is not possible try to create.
 */
var updateOrCreate = function (extern_product, callback) {
  VWHeritageProductCache.findOne({id:extern_product.id}, function(error, old_extern_product) {
    if(error || !old_extern_product || !old_extern_product.id) {
      VWHeritageProductCache.create(extern_product, function (error, result) {
        sails.log.debug("created");
        callback (error, {created:result});
      });
    } else {
      var changes = getChanges(extern_product, old_extern_product);
      if(changes.has_changes) {
        VWHeritageProductCache.update({id:extern_product.id}, changes.changes, function (error, result) {
          sails.log.debug("updated");
          callback (error, {updated:result});
        });
      } else {
        callback (null, null);
      }
    }
  });
}

/**
 * Use updateOrCreate function for each product.
 */
var updateOrCreateEach = function (extern_products, callback) {
  sails.log.debug("updateOrCreateEach");
  sails.log.debug("extern_products.length"+extern_products.length);
  sails.log.debug("callback");
  sails.log.debug(callback);
  async.map(
    extern_products
    , updateOrCreate
    , callback
  );
}

/**
 * Get old and new Product lists,
 * result in callback is an array of old and new lists.
 * (result[0]: old list, result[1]: new list).
 */
var getProductLists = function (callback) {
  async.parallel([
    function(callback) {
      VWHeritageProductCache.find().where().done(callback);
    }
    , function(callback) {
      VWHeritageProduct.find().where().done(callback);
    }
  ], callback);
}

/**
 * Get unused products by an array of product lists (see getProductLists function)
 */
var getUnusedProductsByProductLists = function (product_lists, callback) {
  var old_products = product_lists[0];
  var new_products = product_lists[1];

  getDifference(old_products, new_products, function (unusedProducts) {
    sails.log.debug("unusedProducts");
    sails.log.debug(unusedProducts);
    callback (null, unusedProducts);
  });
}

/**
 * Just get no longger used products
 */
var getUnusedProducts = function (callback) {
  async.waterfall([
    getProductLists
    , getUnusedProductsByProductLists
  ], callback);
}

/**
 * Just remove products
 */
var destroyProducts = function (products, callback) {
  VWHeritageProduct.destroy(products, callback);
}

/**
 * Just remove unused products
 */
var destroyUnusedProducts = function (callback) {
    async.waterfall([
      getUnusedProducts
      , destroyProducts
    ], callback);
}

/**
 * Export new and updated products to cache.
 * Note: This is not removing old products!
 */
var exportToCache = function (callback) {
  async.waterfall([
    VWHeritageProduct.infos
    , updateOrCreateEach
  ], callback);
}

module.exports = {

  unused: function (req, res) {
    getUnusedProducts(function(error, result) {
      if(error) { res.json(error, 500); }
      else { res.json(result); }
    });
  },

  destroyUnused: function (req, res) {
    destroyUnusedProducts(function (error, result) {
      sails.log.info("VWHeritageProduct.removeOld done!");
      if(error) { res.json(error, 500); }
      else { res.json(result); }
    });
  },
    
  exportToCache: function (req, res) {
    exportToCache (function (error, result) {
      sails.log.info("VWHeritageProduct.exportToCache done!");
      if(error) { res.json(error, 500); }
      else { res.json(result); }
    });
  },

  /**
   * Get all products with all informations.
   */
  infos: function (req, res) {
    VWHeritageProduct.infos(function (error, result) {
      if(error) res.json(error, 500);
      else res.json(result);
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to VWHeritageProductController)
   */
  _config: {}

  
};
