var _ = require('underscore');

var isEqual = function (a, b) {
  if(typeof(a) !== typeof(b))
    return false;
  switch (typeof(a)) {
    case 'string':
      if(a == b) return true;
      else return false;
    break;
    case 'number':
      if(a == b) return true;
      else return false;
    break;
    default:
      return _.isEqual(a, b);
    break;
  }
}

/**
 * Get changes of new product by old product
 * FIXME: return strings that are eqat but should only return strings that re NOT equal
 */
var getChanges = function (newProduct, oldProduct) {

  var result = {
    id: oldProduct.id,
    has_changes : false,
    changes : {}
  };
  for (var attribute in newProduct) {
    if(typeof(attribute) !== 'function') {
      // if attribute not equal (ignore id, sku and stores) 
      if( (attribute !== 'id' && attribute !== 'sku' && attribute !== 'stores') && !isEqual(newProduct[attribute], oldProduct[attribute]) ) {
        result.changes[attribute] = newProduct[attribute];
        // sails.log.debug("attribute has changes: "+attribute);
        // sails.log.debug("old value: "+typeof(oldProduct[attribute]));
        // if(oldProduct[attribute] !== 'undefined')
        //   sails.log.debug(oldProduct[attribute]);
        // sails.log.debug("new value: "+typeof(oldProduct[attribute]));
        // if(newProduct[attribute] !== 'undefined')
        //   sails.log.debug(newProduct[attribute]);
        result.has_changes = true;
      }
      if(attribute === 'stores') {
        // iterate stores
        for (var store in newProduct['stores']) {
          // if value not exists in old Product or is not equal
          if( typeof(oldProduct['stores']) === 'undefined' || typeof(oldProduct['stores'][store]) === 'undefined' || !isEqual(newProduct['stores'][store], oldProduct['stores'][store]) ) {
            if(typeof(result.changes['stores']) === 'undefined' )
              result.changes['stores'] = [];
            if(typeof(result.changes['stores'][store]) === 'undefined')
              result.changes['stores'][store] = {};
            // iterate store attributes
            for (var storeAttribute in newProduct['stores'][store]) {
              // if store attribute not exists in old Product or is not equal
              if( typeof(oldProduct['stores']) === 'undefined' || typeof(oldProduct['stores'][store]) === 'undefined' || typeof(oldProduct['stores'][store][storeAttribute]) === 'undefined' || !isEqual(newProduct['stores'][store][storeAttribute], oldProduct['stores'][store][storeAttribute]) ) {
                result.changes['stores'][store][storeAttribute] = newProduct['stores'][store][storeAttribute];
                result.has_changes = true;
              }
            }
            // If store is empty, remove!
            if( _.isEmpty(result.changes['stores'][store]) )
              delete result.changes['stores'][store];
          }
        }
      }
    }
  }
  return result;
}

var update = function (id, newProduct, callback) {
  if(typeof(id) === 'undefined' || id === null || id <= 0 ) {
    if(typeof(newProduct.id) === 'undefined' || newProduct.id === null || newProduct.id <= 0 ) {
      callback("id not set", null);
    } else {
      id = newProduct.id;
    }
  }
  ProductCache.update({id:id}, newProduct, function (error, result) {
    callback (error, result);
  });
};

var create = function (newProduct, callback) {
  ProductAttributeService.makeProductCreateValid(newProduct, function (error, result) {
    if(error) { return sails.log.error(error); callback (error); }
    ProductCache.create( result, function (error, result) {
      if(error) {
        var dup_sku = "E11000 duplicate key error index: magento.productcache.$sku";
        //sails.log.debug(error.message);
        //sails.log.debug(error.message.substring(0, dup_sku.length));
        if(error.message.substring(0, dup_sku.length) === dup_sku ) {
          newProduct.sku += "dup_sku";
          sails.log.debug("ProductCacheService: try to create product again with new sku: "+newProduct.sku);
          create(newProduct, callback);
        } else {
          return sails.log.error(error); callback (error);
        }
      }
      else { callback (error, result); }
    });
  });
};

/**
 * options.makeValid
 */
var updateOnChanges = function (newProduct, oldProduct, callback) {
  var changes = getChanges(newProduct, oldProduct);

  sails.log.debug("check update");
  if(changes.has_changes) {
    var updates = changes.changes;
    updates.id = newProduct.id ? parseInt(newProduct.id) : parseInt(oldProduct.id);
    updates.sku = oldProduct.sku;
    //updates.set = oldProduct.set;
    sails.log.debug("ProductCacheService.updateOrCreate.updateOnChanges HAS changes: ");
    //sails.log.debug(updates);
    update (updates.id, updates, function (error, result) {
      if(error) {
        sails.log.error(error);
        sails.log.error(updates);
      } else {
        callback (error, updates);
      }
    });
  } else {
    sails.log.debug("ProductCacheService.updateOrCreate.updateOnChanges NO changes");
    callback (null, null);
  }
};

var updateOrCreate = function (id, newProduct, callback) {
  ProductCache.findOne({id:id}, function(error, oldProduct) {
  //ProductCache.findOne({sku:newProduct.sku}, function(error, oldProduct) { // WORKAROUND find ProductCache by sku because vwh seems to have duplicated skus 
    if(error || !oldProduct || !oldProduct.id) {
      sails.log.debug("ProductCacheService.updateOrCreate: create");
      create(newProduct, function (error, result) {
        callback (error, {created:result});
      });
    } else {
      sails.log.debug("ProductCacheService.updateOrCreate: updateOnChanges");
      oldProduct = oldProduct.toObject();
      updateOnChanges(newProduct, oldProduct, function (error, result) {
        callback (error, {updated:result});
      });
    }
  });
};

var importOneByID = function (id, callback) {
  id = parseInt(id);
  ProductService.exportOneToCacheByID (id, callback);
}

var listenMagentoChanges = function (callback) {
  DNodeService.eventEmitter.on('catalog_product_save_after', function (error, info) {
    sails.log.info("catalog_product_save_after from ProductCacheService!");
    Config.find({}, function (error, config) {
      config = config[0];
      if(config.listen_extern_changes_on === true) {
        var id = info.product_id ? parseInt(info.product_id) : parseInt(info.id);
        importOneByID(id, function (error, result) {
          if(error) {
            sails.log.error("Error on listenMagentoChanges:");
            sails.log.error(error);
            sails.log.error(result);
            // no Callback, see below
          }
        });
      } else {
        sails.log.info("listen_extern_changes_on is off, do nothing");
      }
    });
  });

  callback(null, true); // Callback don't need to wait of anything
};

var listenExternChanges = function (callback) {
  listenMagentoChanges(function (error, activated) {
    callback(error, activated);
  });
};

module.exports = {
  updateOrCreate : updateOrCreate
  , update : update
  , listenExternChanges : listenExternChanges
}