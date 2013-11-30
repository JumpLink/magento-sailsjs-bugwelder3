/**
 * ProductCache
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

// WORKAROUND
var attributes = require('./ProductAttributes.json');

attributes.stock_data = {
  type: "json"
}

attributes.id = {
  type: 'integer',
  index: true
}

module.exports = {

  adapter: 'mongo'
  , types: {
    weight: function(n){
      return n === +n && n !== (n|0); // is float?
    },
    price: function(n){
      return n === +n && n !== (n|0); // is float?
    }
  }
  , attributes: attributes
};
