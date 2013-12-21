var _ = require('underscore');
var events = require('events');
var eventEmitter = new events.EventEmitter();

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
 */
var getChanges = function (new_product, old_product) {
  var result = {
    has_changes : false
    , changes : {}
  };
  for (var attribute in new_product) {
    if( !isEqual(new_product[attribute], old_product[attribute]) ) {
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
  VWHProductCache.update({id:id}, product, function(error, result) {
    callback (error, result);
  });
}

/**
 * Just remove products and emit event.
 */
var destroy = function (products, callback) {
  //eventEmitter.emit('destroy_before', null, products);
  VWHProductCache.destroy(products, function (error, result) {
    eventEmitter.emit('destroy_after', error, products);
    callback (error, result);
  });
}

/**
 * Just remove products and emit event.
 */
var create = function (product, callback) {
  VWHProductCache.create(product, callback);
}

/**
 * Update VWHProductCache and Product on changes.
 */
var updateOnChanges = function (new_product, old_product, callback) {
  var changes = getChanges(new_product, old_product);
  // sails.log.debug("check update");
  if(changes.has_changes) {
    var updates = changes.changes;
    updates.id = new_product.id ? new_product.id : old_product.id;
    updates.sku = new_product.sku ? new_product.sku : old_product.sku;

    update (updates.id, updates, callback);
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
      old_product = old_product.toObject();
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
  sails.log.debug("VWHProductCacheService: updateOrCreateEach");
  sails.log.debug("VWHProductCacheService: newProducts.length "+newProducts.length);
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

var importFromSourceWithLog = function (callback) {
  async.series([
    async.apply(Log.create, { 
      error: false
      , model: 'VWHProductCache'
      , action: 'import'
      , status: 'start'
    })
    , importFromSource
    , async.apply(Log.create, { 
      error: false
      , model: 'VWHProductCache'
      , action: 'import'
      , status: 'done'
    })
  ], function importFromSourceWithLogDone (error, results){
    Log.create({ 
      error: typeof(error) === 'undefined' ? false : true
      , model: 'VWHProductCache'
      , action: 'import'
      , status: 'done'
      , value: typeof(error) === 'undefined' ? results[1] : error
      , message: typeof(error) === 'undefined' ? results[1].length + "succesfull imported" : "Can't import Products"
    }, callback);
    callback(error, results); // Do not wait for Log with Callbacks
  });
}

module.exports = {
  updateOnChanges : updateOnChanges
  , updateOrCreateEach : updateOrCreateEach
  , updateOrCreate : updateOrCreate
  , destroy : destroy
  , update : update
  , create : create
  , import : importFromSource
  , importWithLog : importFromSourceWithLog
  , eventEmitter : eventEmitter
}