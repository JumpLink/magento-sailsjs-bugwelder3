var _ = require('underscore');
var events = require('events');
var eventEmitter = new events.EventEmitter();

/**
 * Get changes of new product by old product 
 */
var getChanges = function (new_product, old_product) {
  var result = {
    id: old_product.id
    , sku: old_product.sku
    , has_changes : false
    , changes : {}
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
 * Just update product and emit event.
 */
var update = function (id, product, callback) {
  sails.log.debug("VWHProductCacheService: update product with id: "+id);
  eventEmitter.emit('update_before', null, product);
  VWHProductCache.update({id:id}, product, function (error, result) {
    eventEmitter.emit('update_after', error, product);
    callback (error, product);
  });
}

/**
 * Just remove products and emit event.
 */
var destroy = function (products, callback) {
  eventEmitter.emit('destroy_before', null, products);
  VWHProductCache.destroy(products, function (error, result) {
    eventEmitter.emit('destroy_after', error, products);
    callback (error, result);
  });
}

/**
 * Just remove products and emit event.
 */
var create = function (product, callback) {
  eventEmitter.emit('create_before', null, product);
  VWHProductCache.create(product, function (error, result) {
    eventEmitter.emit('create_after', error, product);
    callback (error, result);
  });
}

/**
 * Update VWHProductCache and Product on changes.
 */
var updateOnChanges = function (new_product, old_product, callback) {
  var changes = getChanges(new_product, old_product);
  // sails.log.debug("check update");
  if(changes.has_changes) {
    var updates = changes.changes;
    updates.id = changes.id;
    updates.sku = changes.sku;

    update (changes.id, updates, callback);
  } else {
    callback (null, null);
  }
}

/**
 * Update Product, if this is not possible try to create.
 */
var updateOrCreate = function (new_product, callback) {
  // sails.log.debug("updateOrCreate on VWHProductCache");
  VWHProductCache.findOne({id:new_product.id}, function(error, old_product) {
    if(error || !old_product || !old_product.id) {
      //sails.log.debug("try to create");
      create(new_product, function (error, result) {
        callback (error, {created:result});
      });
    } else {
      updateOnChanges(new_product, old_product, function (error, result) {
        callback (error, {updated:result});
      });
    }
  });
}

/**
 * Use updateOrCreate function for each product.
 */
var updateOrCreateEach = function (newProducts, callback) {
  // sails.log.debug("updateOrCreateEach");
  // sails.log.debug("newProducts.length "+newProducts.length);
  async.map(
    newProducts
    , updateOrCreate
    , function normalizeResult (error, result) {
      sails.log.debug("updateOrCreateEach result length: "+result.length);
      if(!error && typeof(result) !== 'undefined' && result.length) {
        var normalized = {
          updates : []
          , creates : []
        };
        for (var i = 0; i < result.length; i++) {
          if(result[i] !== null) {
            if(result[i].updated)
              normalized.updates.push(result[i].updated);
            if(result[i].created)
              normalized.creates.push(result[i].created);
          }
        };
      }
      callback(error, normalized);
    }
  );
}

/**
 * Export new and updated products to cache.
 * Note: This is not removing old products!
 */
var importFromSource = function (callback) {
  async.waterfall([
    VWHProduct.infos
    , updateOrCreateEach
  ], callback);
}

module.exports = {
  updateOnChanges : updateOnChanges
  , updateOrCreateEach : updateOrCreateEach
  , updateOrCreate : updateOrCreate
  , destroy : destroy
  , update : update
  , create : create
  , import : importFromSource
  , eventEmitter : eventEmitter
}