var _ = require('underscore');

/**
 * Get changes of new product by old product 
 */
var getChanges = function (newProduct, oldProduct) {
  var result = {
    id: oldProduct.id,
    has_changes : false,
    changes : {}
  };
  for (var attribute in newProduct) {
    if(attribute != 'id' && attribute != 'sku' && oldProduct[attribute] && !_.isEqual(newProduct[attribute], oldProduct[attribute]) ) {
      result.changes[attribute] = newProduct[attribute];
      result.has_changes = true;
    }
  }
}

/**
 *  @return boolean
 */
var updateHasStockChanges = function (newProduct) {
  if(typeof(newProduct.stock_vwheritage_qty) !== 'undefined')
    return true;
  if(typeof(newProduct.stock_strichweg_qty) !== 'undefined')
    return true;
  if(typeof(newProduct.stock_data) !== 'undefined' && typeof(newProduct.stock_data.qty) )
    return true;
  return false;
}

/**
 *  @return boolean
 */
var updateHasAllStockValues = function (newProduct) {
  if( typeof(newProduct.stock_vwheritage_qty) !== 'undefined' && typeof(newProduct.stock_strichweg_qty) !== 'undefined' )
    return true;
  return false;
}

/**
 *  @return boolean
 */
var updateNeedOldStock = function (newProduct) {
  if(updateHasStockChanges(newProduct) && !updateHasAllStockValues(newProduct)) {
    return true;
  }
  return false;
}

var generateStock = function (product, callback) {
 if(product.stock_data)
  product.stock_data = {};
  product.stock_data.qty = product.stock_vwheritage_qty + product.stock_strichweg_qty;
  product.stock_data.is_in_stock = (product.stock_data.qty > 0) ? 1 : 0;
  callback(null, product);
}

var insertOldStock = function (newProduct, oldProduct) {
  sails.log.debug("insertOldStock");
  sails.log.debug("newProduct");
  sails.log.debug(newProduct);
  sails.log.debug("oldProduct");
  sails.log.debug(oldProduct);
  if(typeof(newProduct.stock_vwheritage_qty) === 'undefined')
    newProduct.stock_vwheritage_qty = oldProduct.stock_vwheritage_qty;
  if(typeof(newProduct.stock_strichweg_qty) === 'undefined')
    newProduct.stock_strichweg_qty = oldProduct.stock_strichweg_qty;
  return newProduct;
}

/**
 *  @param oldProduct (optinally)
 */
var getStock = function (id, newProduct, oldProduct, callback) {
  if (updateNeedOldStock) {
    if(typeof(oldProduct) === 'undefined' || oldProduct === null) {
      ProductCache.findOne({id:id}, function(error, result) {
        if(error)  {
          callback(error, null);
        } else {
          oldProduct = result;
          newProduct = insertOldStock (newProduct, oldProduct);
          generateStock(newProduct, callback);
        }
      });
    } else {
      newProduct = insertOldStock (newProduct, oldProduct);
      generateStock(newProduct, callback);
    }
  } else {
    generateStock(newProduct, callback);
  }
} 

/**
 *  @param oldProduct (optinally)
 * TODO move stock check to modell
 */
var update = function (id, newProduct, oldProduct, callback) {

  if(typeof(id) === 'undefined' || id == 0 | id === null) {
    if(typeof(newProduct.id) === 'undefined') {
      if(typeof(oldProduct.id) === 'undefined') {
        callback("Id is not set!", null);
      } else { id = oldProduct.id; }
    } else { id = newProduct.id; }
  }
  if (updateHasStockChanges) {
    getStock(id, newProduct, oldProduct, function(error, productWithStock) {
      Product.update({id:id}, newProduct, function (error, result) {
        // sails.log.error(error);
        // sails.log.debug(result);
        callback (error, result);
      });
    });
  } else {
    Product.update({id:id}, newProduct, function (error, result) {
      // sails.log.error(error);
      // sails.log.debug(result);
      callback (error, result);
    });
  }
}

var updateOnChanges = function (newProduct, oldProduct, callback) {
  var changes = getChanges(newProduct, oldProduct);

  sails.log.debug("check update");
  if(changes.has_changes) {
    var updates = changes.changes;
    updates.id = oldProduct.id;
    updates.sku = oldProduct.sku;
    update (oldProduct.id, changes.changes, oldProduct, function (error, result) {
      callback (error, {updated:changes.changes});
    });
  } else {
    callback (null, null);
  }
};

var updateOrCreate = function (newProduct, last_callback) {
  ProductCache.findOne({id:newProduct.id}, function(error, oldProduct) {
    if(error || !oldProduct || !oldProduct.id) {
      sails.log.debug("try to create");
      Product.create(newProduct, function (error, result) {
        callback (error, {created:result});
      });
    } else {
      updateOnChanges(newProduct, oldProduct, callback);
    }
  });
};

var updateIfExists = function (newProduct, last_callback) {
  ProductCache.findOne({sku:newProduct.sku}, function(error, oldProduct) {
    if(error || !oldProduct || !oldProduct.id) {
      sails.log.warn("Product not exists, do nothing!");
      last_callback(null, null);
    } else {
      updateOnChanges(newProduct, oldProduct, callback);
    }
  });
};

var onVWHProductCacheUpdate = function (error, product) {
  sails.log.debug("VWHProductCacheService update_after from ProductService!");
  var include_english = true;
  var include_german = false;
  var include_groupprice = false;
  sails.log.debug(product);
  PortVWHService.portToMagentoProduct(product, include_english, include_german, include_groupprice, function (error, portedProduct) {
    sails.log.debug(portedProduct);
    updateIfExists(portedProduct, function (error, result) {
      sails.log.debug("Magento Product updated!");
      sails.log.debug(result);
      // ...
    });
  });
}

var listenVWHProductCacheChanges = function (callback) {
  VWHProductCacheService.eventEmitter.on('update_before', function (error, product) {
    sails.log.warn("VWHProductCacheService update_before from ProductService!");
  });

  VWHProductCacheService.eventEmitter.on('update_after', onVWHProductCacheUpdate);

  VWHProductCacheService.eventEmitter.on('destroy_before', function (error, product) {
    sails.log.warn("VWHProductCacheService destroy_before from ProductService!");
  });
  VWHProductCacheService.eventEmitter.on('destroy_after', function (error, product) {
    sails.log.warn("VWHProductCacheService destroy_after from ProductService!");
  });
  VWHProductCacheService.eventEmitter.on('create_before', function (error, product) {
    sails.log.warn("VWHProductCacheService destroy_after from ProductService!");
  });
  VWHProductCacheService.eventEmitter.on('create_after', function (error, product) {
    sails.log.warn("VWHProductCacheService destroy_after from ProductService!");
  });
  callback(null, true);
};

var listenExternChanges = function (callback) {
  listenVWHProductCacheChanges(function (error, activated) {
    callback(error, activated);
  });
};

var exportOneToCacheByID = function (id, final_callback) {
  sails.log.debug("exportOneToCacheByID id: "+id);
  async.waterfall([
    function findProduct (callback) {
      Product.findOne({id:id}, function findProductDone (err, product_info) {
        sails.log.debug("findProductDone");
        callback (err, product_info);
      });
    }
    , function updateOrCreateProduct (product_info, callback){
      // sails.log.info(product_info);
      sails.log.info("product getted");
      ProductCacheService.updateOrCreate(product_info.id, product_info, function updateOrCreateProductDone (err, updated) {
        sails.log.debug("updateOrCreateProductDone");
        callback (err, updated);
      });
    }
  ], function exportOneToCacheByIDDone (err, result) {
    sails.log.debug("exportOneToCacheByIDDone");
    final_callback (err, result);
  });
};

var repairOneByID = function (id, final_callback) {
  async.waterfall([
    function findProduct (callback) {
      Product.findOne({id:id}, function findProductDone (err, product_info) {
        callback (err, product_info);
      });
    }
    , function repairProduct (product_info, callback) {
      ProductAttributeService.makeProductValid(product_info, function repairProductDone (err, repairedProduct) {
        callback (err, repairedProduct);
      });
    }
    , function updateProduct (repairedProduct, callback){
      update(id, repairedProduct, null, function updateProductDone (err, updated) {
        callback (err, updated);
      });
    }
  ], function repairOneByIDDone (err, result) {
    sails.log.debug("repairOneByIDDone");
    final_callback (err, result);
  });
};

var exportEachByProductList = function (product_list, final_callback) {
  // In series to avoid EMFILE Error
  // TODO async.mapSeries?
  async.eachSeries (
    product_list
    , function iterator (item, callback) {
      //sails.log.debug(item);
      exportOneToCacheByID(item.id, function iteratorDone (error, result) {
        // sails.log.debug("iteratorDone");
        // sails.log.debug("error");
        // sails.log.error(error);
        // sails.log.debug("result");
        // sails.log.debug(result);
        // sails.log.debug("callback");
        // sails.log.debug(callback);
        callback(error, result);
      });
    }
    , final_callback
  );
}

var repairEachByProductList = function (product_list, final_callback) {
  // In series to avoid EMFILE Error
  // TODO async.mapSeries?
  async.eachSeries (
    product_list
    , function iterator (item, callback) {
      repairOneByID(item.id, function iteratorDone (error, result) {
        callback(error, result);
      });
    }
    , final_callback
  );
}

var getProductList = function (callback) {
  Product.find().where().done(function getProductListDone (err, product_list) {
    sails.log.debug ("product_list.length");
    sails.log.debug (product_list.length);
    callback (err, product_list);
  });
}

/**
 * Export all your Magento Products to MongoDB using the ProductCacheController.  
 */
var exportToCache = function (callback) {
  async.waterfall([
    // get product list with less informations, just with with id, sku, name, ..
    getProductList
    , exportEachByProductList
  ], function exportToCacheDone (err, result) {
    callback (err, result);
  });
};


/**
 * Get all your Magento Products, make invalid Product Attributes valid and update.  
 */
var repair = function (callback) {
  async.waterfall([
    // get product list with less informations, just with with id, sku, name, ..
    getProductList
    , repairEachByProductList
  ], function repairDone (err, result) {
    if(err)
      sails.log.error(err);
    callback (err, result);
  });
};

/**
 * Generate Sails.js compatible Attributes for the Product Model.   
 */ 
var generateAttributes = function (callback) {
  ProductModelAttributesGeneratorService.generator.product(function (err, attributes) {
    fs.writeFile("./api/models/ProductAttributes.json", JSON.stringify(attributes, null, 4), function generateAttributesDone (error) {
      callback (error, attributes);
    }); 
  });
};

module.exports = {
  updateOnChanges : updateOnChanges
  , updateOrCreate : updateOrCreate
  , listenExternChanges : listenExternChanges
  , exportOneToCacheByID : exportOneToCacheByID
  , exportToCache : exportToCache
  , generateAttributes : generateAttributes
  , repair : repair
}