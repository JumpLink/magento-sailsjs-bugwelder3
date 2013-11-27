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

attributes.stock_data = {
  type: "json"
}

attributes.product_id = {
  type: 'integer',
  index: true
}

module.exports = {
  adapter: 'magento-dnode'
  , attributes: attributes
};
