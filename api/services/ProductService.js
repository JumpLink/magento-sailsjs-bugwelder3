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
  return result;
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
  product.stock_data = {};
  product.stock_data.qty = product.stock_vwheritage_qty + product.stock_strichweg_qty;
  product.stock_data.is_in_stock = (product.stock_data.qty > 0) ? 1 : 0;
  callback(null, product);
}

var insertOldStock = function (newProduct, oldProduct) {
  // sails.log.debug("insertOldStock");
  // sails.log.debug("newProduct");
  // sails.log.debug(newProduct);
  // sails.log.debug("oldProduct");
  // sails.log.debug(oldProduct);
  if(typeof(newProduct.stock_vwheritage_qty) === 'undefined')
    newProduct.stock_vwheritage_qty = oldProduct.stock_vwheritage_qty;
  if(typeof(newProduct.stock_strichweg_qty) === 'undefined')
    newProduct.stock_strichweg_qty = oldProduct.stock_strichweg_qty;
  return newProduct;
}

/**
 *  @param oldProduct (optinally)
 */
var getOldStock = function (id, newProduct, oldProduct, callback) {
  if (updateNeedOldStock) {
    if(typeof(oldProduct) === 'undefined' || oldProduct === null) {
      ProductCache.findOne({id:id}, function(error, oldProduct) {
        if(error)  {
          callback(error, null);
        } else {
          oldProduct = oldProduct.toObject();
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

var updateOnChanges = function (newProduct, oldProduct, callback) {
  var changes = getChanges(newProduct, oldProduct);

  sails.log.debug("check update");
  if(changes.has_changes) {
    var updates = changes.changes;
    updates.id = newProduct.id ? newProduct.id : oldProduct.id;
    updates.sku = newProduct.sku ? newProduct.sku : oldProduct.sku;
    Product.update ({id:updates.id}, updates, function (error, result) {
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
      oldProduct = oldProduct.toObject();
      updateOnChanges(newProduct, oldProduct, callback);
    }
  });
};

var updateIfExists = function (newProduct, last_callback) {
  ProductCache.findOne({sku:newProduct.sku}, function(error, oldProduct) {
    if(error || !oldProduct || !oldProduct.id) {
      sails.log.warn("Product not exists, do nothing! SKU: "+newProduct.sku);
      last_callback(null, null);
    } else {
      oldProduct = oldProduct.toObject();
      updateOnChanges(newProduct, oldProduct, last_callback);
    }
  });
};

var onVWHProductCacheUpdate = function (error, product) {
  
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
      return;
    });
  });
}

var listenVWHProductCacheChanges = function (callback) {
  VWHProductCacheService.eventEmitter.on('update_before', function (error, product) {
    sails.log.warn("VWHProductCacheService update_before from ProductService!");
  });

  VWHProductCacheService.eventEmitter.on('update_after', function (error, product) {
    sails.log.debug("VWHProductCacheService update_after from ProductService!");
    onVWHProductCacheUpdate(error, product);
  });

  VWHProductCacheService.eventEmitter.on('destroy_before', function (error, product) {
    sails.log.debug("VWHProductCacheService destroy_before from ProductService!");
  });
  VWHProductCacheService.eventEmitter.on('destroy_after', function (error, product) {
    sails.log.debug("VWHProductCacheService destroy_after from ProductService!");
  });
  VWHProductCacheService.eventEmitter.on('create_before', function (error, product) {
    sails.log.debug("VWHProductCacheService create_before from ProductService!");
  });
  VWHProductCacheService.eventEmitter.on('create_after', function (error, product) {
    sails.log.debug("VWHProductCacheService create_after from ProductService!");
    onVWHProductCacheUpdate(error, product);
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
      Product.findOne({id:id}, function findProductDone (error, product_info) {
        sails.log.debug("findProductDone");
        if(error) {
          sails.log.error("ProductService.exportOneToCacheByID.findProduct:");
          sails.log.error(error);
          callback (error, null);
        } else {
          product_info = product_info.toObject();
          if(!product_info.id)
            product_info.id = parseInt(id);
          sails.log.debug(product_info);
          callback (error, product_info);
        }
      });
    }
    , function updateOrCreateProduct (product_info, callback){
      // sails.log.info(product_info);
      sails.log.info("product getted");
      ProductCacheService.updateOrCreate(product_info.id, product_info, function updateOrCreateProductDone (error, updated) {
        sails.log.debug("updateOrCreateProductDone");
        if(error) {
          sails.log.error("ProductService.exportOneToCacheByID.updateOrCreateProduct:");
          sails.log.error(error);
          callback (error, null);
        } else {
          callback (error, updated);
        }
      });
    }
  ], function exportOneToCacheByIDDone (error, result) {
    sails.log.debug("exportOneToCacheByIDDone");
    final_callback (error, result);
  });
};

/**
 * If they are invalid products in Magento, you can't export this even if you do not repair it
 */
var repairOneByID = function (id, final_callback) {
  async.waterfall([
    function findProduct (callback) {
      Product.findOne({id:id}, function findProductDone (error, product_info) {
        if(error) { sails.log.error(error); callback (error); }
        else { product_info = product_info.toObject(); callback (error, product_info); }
      });
    }
    , function repairProduct (product_info, callback) {
      ProductAttributeService.makeProductValid(product_info, function repairProductDone (error, repairedProduct) {
        callback (error, repairedProduct);
      });
    }
    , function updateProduct (repairedProduct, callback){
      Ṕroduct.update({id:id}, repairedProduct, function updateProductDone (error, updated) {
        callback (error, updated);
      });
    }
  ], function repairOneByIDDone (error, result) {
    sails.log.debug("repairOneByIDDone");
    final_callback (error, result);
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
  Product.find().where().done(function getProductListDone (error, product_list) {
    sails.log.debug ("product_list.length");
    sails.log.debug (product_list.length);
    callback (error, product_list);
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
  ], function exportToCacheDone (error, result) {
    callback (error, result);
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
  ], function repairDone (error, result) {
    if(err)
      sails.log.error(error);
    callback (error, result);
  });
};

/**
 * Generate Sails.js compatible Attributes for the Product Model.   
 */ 
var generateAttributes = function (callback) {
  ProductModelAttributesGeneratorService.generator.product(function (error, attributes) {
    fs.writeFile("./api/models/ProductAttributes.json", JSON.stringify(attributes, null, 4), function generateAttributesDone (error) {
      callback (error, attributes);
    }); 
  });
};

module.exports = {
  updateOnChanges             : updateOnChanges
  , updateOrCreate            : updateOrCreate
  , listenExternChanges       : listenExternChanges
  , exportOneToCacheByID      : exportOneToCacheByID
  , exportToCache             : exportToCache
  , generateAttributes        : generateAttributes
  , repair                    : repair
  , updateNeedOldStock        : updateNeedOldStock
  , getOldStock               : getOldStock
}