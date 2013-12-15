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
 * Get old and new Product lists,
 * result in callback is an array of old and new lists.
 * (result[0]: old list, result[1]: new list).
 */
var getProductLists = function (callback) {
  async.parallel([
    function(callback) {
      VWHProductCache.find().where().done(callback);
    }
    , function(callback) {
      VWHProduct.find().where().done(callback);
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
 * Just remove unused products
 */
var destroyUnusedProducts = function (callback) {
    async.waterfall([
      getUnusedProducts
      , VWHProductCacheService.destroy
    ], callback);
}

/**
 * Export new and updated products to cache.
 * Note: This is not removing old products!
 */
var exportToCache = function (callback) {
  async.waterfall([
    VWHProduct.infos
    , VWHProductCacheService.updateOrCreateEach
  ], callback);
}

/**
 * Sync new, updated and destroyed products to cache.
 */
var syncToCache = function (callback) {
  async.waterfall([
    exportToCache
    , function (exportResult) {
      destroyUnusedProducts(function (error, destroyed) {
        exportResult['destroyed'] = destroyed;
        callback(error, exportResult);
      });
    }
  ], callback);
}

module.exports = {
  getUnusedProducts : getUnusedProducts
  , destroyUnusedProducts : destroyUnusedProducts
  , exportToCache : exportToCache
  , syncToCache : syncToCache
  //, eventEmitter : eventEmitter

}