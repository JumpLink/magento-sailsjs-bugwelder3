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
    if(attribute !== 'id' && attribute !== 'sku' && attribute !== 'stores' && oldProduct[attribute] && !_.isEqual(newProduct[attribute], oldProduct[attribute]) ) {
      result.changes[attribute] = newProduct[attribute];
      result.has_changes = true;
    }
    if(attribute === 'stores') {
      for (var store in newProduct[attribute]) {
        if( oldProduct[attribute][store] && !_.isEqual(newProduct[attribute][store], oldProduct[attribute][store])) {
          if(typeof(result.changes[attribute]) === 'undefined' )
            result.changes[attribute] = [];
          if(typeof(result.changes[attribute][store]) === 'undefined')
            result.changes[attribute][store] = {};
          for (var storeAttribute in result.changes[attribute][store]) {
            if(oldProduct[attribute][store][storeAttribute] &&  _.isEqual(newProduct[attribute][store][storeAttribute], oldProduct[attribute][store][storeAttribute]) ) {
              result.changes[attribute][store][storeAttribute] = newProduct[attribute][store][storeAttribute];
            }
          }
        }
      }
    }
  }
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

var updateValid = function (id, setID, newProduct, callback) {

}

/**
 * options.makeValid
 */
var updateOnChanges = function (newProduct, oldProduct, options, callback) {
  var changes = getChanges(newProduct, oldProduct);

  sails.log.debug("check update");
  if(changes.has_changes) {
    var updates = changes.changes;
    updates.id = oldProduct.id;
    updates.sku = oldProduct.sku;
    updates.set = oldProduct.set;
    if (typeof(options.makeValid) !== 'undefined' && options.makeValid) {
      updateValid (oldProduct.id, oldProduct.set, changes.changes, function (error, result) {
        callback (error, changes.changes);
      });
    } else {
      update (oldProduct.id, changes.changes, function (error, result) {
        callback (error, changes.changes);
      });
    }

  } else {
    callback (null, null);
  }
};

var updateOrCreate = function (id, newProduct, callback) {
  ProductCache.findOne({id:id}, function(error, oldProduct) {
    if(error || !oldProduct || !oldProduct.id) {
      ProductCache.create(newProduct, function (error, result) {
        callback (error, {created:result});
      });
    } else {
      var options = {};
      updateOnChanges(newProduct, oldProduct, options, function (error, result) {
        callback (error, {updated:result});
      });
    }
  });
};

var importOneByID = function (id, callback) {
  ProductService.exportOneToCacheByID (id, callback);
}



var listenMagentoChanges = function (callback) {
  DNodeService.eventEmitter.on('catalog_product_save_after', function (error, info) {
    sails.log.warn("catalog_product_save_after from ProductCacheService!");
    importOneByID(info.product_id, function (error, result) {
      if(error) {
        sails.log.error("Error on listenMagentoChanges:");
        sails.log.error(error);
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