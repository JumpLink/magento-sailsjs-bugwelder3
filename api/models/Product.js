/**
 * Product
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

/*
var attributes;
var self = this;
*/

// WORKAROUND
var attributes = require('./ProductAttributes.json');

if(attributes === null)
  attributes = {};

module.exports = {
  adapter: 'magento-dnode'
  , attributes: attributes
  , beforeCreate : function (values, next) {
    sails.log.debug("Product: beforeCreate");
    next();
  }
  , afterCreate : function (newlyInsertedRecord, next) {
    Log.create({
      //error: false,
      model: 'Product',
      action: 'create',
      values: newlyInsertedRecord
    }, function (error, result) {
      if(error) { sails.log.error(error); next(error); }
      else { next(); }
    });
  }
  , beforeUpdate : function (newProduct, next) {
    sails.log.debug("Product: beforeUpdate");
    sails.log.debug(newProduct);
    var id = newProduct.id;
    if (ProductService.updateNeedOldStock(newProduct)) {
      var oldProduct = null;
      ProductService.getOldStock(id, newProduct, oldProduct, function(error, newProductWithStock) {
        newProduct = newProductWithStock;
        if(error) { return sails.log.error(error); next (error); }
        else { next (); }
      });
    } else {
      next ();
    }
  }
  , afterUpdate : function (updatedRecord, next) {
    // ProductService.eventEmitter.emit('update_after', null, updatedRecord); // Product event is emitted in DNodeService
    Log.create({
      //error: false,
      model: 'Product',
      action: 'update',
      values: updatedRecord
    }, function (error, result) {
      if(error) { sails.log.error(error); next(error); }
      else { next(); }
    });
  }
};