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
        for (var store in newProduct[attribute]) {
          if( oldProduct[attribute][store] && !isEqual(newProduct[attribute][store], oldProduct[attribute][store])) {
            if(typeof(result.changes[attribute]) === 'undefined' )
              result.changes[attribute] = [];
            if(typeof(result.changes[attribute][store]) === 'undefined')
              result.changes[attribute][store] = {};
            for (var storeAttribute in result.changes[attribute][store]) {
              if(!isEqual(newProduct[attribute][store][storeAttribute], oldProduct[attribute][store][storeAttribute]) ) {
                result.changes[attribute][store][storeAttribute] = newProduct[attribute][store][storeAttribute];
                result.has_changes = true;
              }
            }
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
      if(error) { return sails.log.error(error); callback (error); }
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
    sails.log.warn("catalog_product_save_after from ProductCacheService!");
    var id = info.product_id ? parseInt(info.product_id) : parseInt(info.id);
    importOneByID(id, function (error, result) {
      if(error) {
        sails.log.error("Error on listenMagentoChanges:");
        sails.log.error(error);
        sails.log.error(result);
      }
    });
  });

  callback(null, true);
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