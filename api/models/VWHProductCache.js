/**
 * VWHeritageProductCache
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true
  , adapter: 'mongo'
  , attributes: {
    originaldescription: 'string'
    , fittinginfo: 'string'
    , quality: 'string'
    , description: 'string'
    , applications: 'array'
    , sku: 'string'
    , sku_clean: 'string'
    , name: 'string'
    , special_order: 'boolean'
    , free_stock_quantity: 'integer'
    , retail_price: 'float'
    , cost_price: 'float'
    , dueweeks: 'integer'
    , weight: 'float'
    , availability_message_code: 'integer'
    , price_2: 'float'
    , price_3: 'float'
    , price_4: 'float'
    , createdAt: 'date'
    , updatedAt: 'date'
    , id: {
      type: "integer"
      , unique: true
      , required: true
      , primaryKey: true
    }
    , toObject: function () {
      // Clone Self
      var self = _.clone(this);
      Object.keys(self).forEach(function(key) {
        // Remove any functions
        if(typeof self[key] === 'function') {
          delete self[key];
        }
        // Be shure id is an integer
        if(key === 'id') {
          self[key] = parseInt(self[key]);
        }
      });
      return self;
    }
  }
  , beforeCreate : function (values, next) {
    sails.log.debug("VWHProductCache: beforeCreate");
    VWHProductCacheService.eventEmitter.emit('create_before', null, values);
    next();
  }
  , afterCreate : function (newlyInsertedRecord, next) {
    sails.log.error("VWHProductCache: afterCreate");
    VWHProductCacheService.eventEmitter.emit('create_after', null, newlyInsertedRecord);
    Log.create({
      //error: false,
      model: 'VWHProductCache',
      action: 'create',
      values: newlyInsertedRecord
    }, function (error, result) {
      if(error) { sails.log.error(error); next(error); }
      else { next(); }
    });
  }
  , beforeUpdate : function (valuesToUpdate, next) {
    sails.log.debug("VWHProductCache: beforeUpdate");
    VWHProductCacheService.eventEmitter.emit('update_before', null, valuesToUpdate);
    next();
  }
  , afterUpdate : function (updatedRecord, next) {
    sails.log.debug("VWHProductCache: afterUpdate");
    VWHProductCacheService.eventEmitter.emit('update_after', null, updatedRecord);
    Log.create({
      //error: false,
      model: 'VWHProductCache',
      action: 'update',
      values: updatedRecord
    }, function (error, result) {
      if(error) { sails.log.error(error); next(error); }
      else { next(); }
    });
  }
  , beforeDestroy : function (criteria, next) {
    sails.log.debug("VWHProductCache: beforeDestroy");
    VWHProductCacheService.eventEmitter.emit('destroy_before', null, criteria);
    next();
  }
  , afterDestroy : function (next) {
    sails.log.debug("VWHProductCache: afterDestroy");
    //VWHProductCacheService.eventEmitter.emit('destroy_after', null, updatedRecord);
    next();
  }
};
