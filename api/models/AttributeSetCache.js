/**
 * AttributeSetCache
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  adapter: 'mongo',

  attributes: {
    
    id : {
      type: 'integer',
      index: true,
      required: true,
    },

    name : {
      type: 'string',
      required: true
    },
    
    attributes : {
      type: 'json',
      required: true
    }
    
  }

};
