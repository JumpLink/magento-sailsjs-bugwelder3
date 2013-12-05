/**
 * Store
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  adapter: 'magento-dnode',

  attributes: {
    id: {
      type: "integer",
      unique: true,
      index: true,
      required: true
    },
    code: {
      type: "string"
    },
    website_id: {
      type: "integer"
    },
    group_id: {
      type: "integer"
    },
    name: {
      type: "string"
    },
    sort_order: {
      type: "integer"
    },
    is_active: {
      type: "boolean"
    }
  }
};
