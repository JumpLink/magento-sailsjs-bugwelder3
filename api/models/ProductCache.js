/**
 * ProductCache
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

// WORKAROUND
var attributes = require('./ProductAttributes.json');

if(attributes === null)
  attributes = {};

attributes.toObject = function () {
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
};

module.exports = {
  schema: true
  , adapter: 'mongo'
  , attributes: attributes
  // IMPORTANT NOTE: see ProductAttributeService for makeProductCreateValid
  , beforeValidation : function (newProduct, next) {
    sails.log.debug("ProductCache: beforeValidation");
    ProductAttributeService.makeProductUpdateValid(newProduct, function (error, result) {
      if(error) { return sails.log.error(error); next (error); }
      else { newProduct = result; next(); }
    });
  }
  , beforeCreate : function (newProduct, next) {
    sails.log.debug("ProductCache: beforeCreate");
    next();
  }
  , afterCreate : function (newlyInsertedRecord, next) {
    sails.log.debug("ProductCache: afterCreate");
    Log.create({
      //error: false,
      model: 'ProductCache',
      action: 'create',
      values: newlyInsertedRecord
    }, function (error, result) {
      if(error) { sails.log.error(error); next(error); }
      else { next(); }
    });
  }
  , beforeUpdate : function (newProduct, next) {
    sails.log.debug("ProductCache: beforeUpdate");
    sails.log.debug(newProduct);
    ProductAttributeService.makeProductUpdateValid(newProduct, function (error, result) {
      if(error) { return sails.log.error(error); next (error); }
      else { newProduct = result; next(); }
    });
  }
  , afterUpdate : function (updatedRecord, next) {
    sails.log.debug("ProductCache: afterUpdate");
    Log.create({
      //error: false,
      model: 'ProductCache',
      action: 'update',
      values: updatedRecord
    }, function (error, result) {
      if(error) { sails.log.error(error); next(error); }
      else { next(); }
    });
  }
};