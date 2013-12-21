/**
 * Log
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	adapter: 'mongo'
    , attributes: {
      /* on error true */
      error: {
        type: "boolean"
      }
      , model: {
        type: "string"
      }
      , service: {
        type: "string"
      }
      , action: {
        type: "string"
      }
      /* result of action */
      , value: {
        type: 'json'
      }
      /* results of action */
      , values: {
        type: 'array'
      }
      /* message e.g. on error */
      , message: {
        type: "string"
      }
      /* start, done */
      , status : {
        type: "string"
      }
    }
    
  }
  , beforeCreate : function (values, next) {
    sails.log.warn("Log: beforeCreate");
    next();
  }
  , afterCreate : function (newlyInsertedRecord, next) {
    sails.log.debug("Log: afterCreate");
    next();
  }
  , beforeUpdate : function (valuesToUpdate, next) {
    sails.log.debug("Log: beforeUpdate");
    next();
  }
  , afterUpdate : function (updatedRecord, next) {
    sails.log.debug("Log: afterUpdate");
    next();
  }
  , beforeDestroy : function (criteria, next) {
    sails.log.debug("Log: destroy_before");
    next();
  }
  , afterDestroy : function (next) {
    sails.log.debug("Log: afterDestroy");
    next();
  }
};
