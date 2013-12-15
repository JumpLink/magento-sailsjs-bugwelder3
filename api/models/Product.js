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
  , types: {
      weight: function(n){
      return true; // TODO is float?
    }
    , price: function(n){
      return true; // TODO is float?
    }
    , tier_price: function(n){
      return true; // TODO
    }
    , stock_data: function(n){
      return true; // TODO
    }
    , select: function(n){
      return true; // TODO
    }
    , "array of integer": function(n){
      return true; // TODO
    }
    , "array of float": function(n){
      return true; // TODO
    }
    , "array of string": function(n){
      return true; // TODO
    }
  }
  , attributes: attributes
};