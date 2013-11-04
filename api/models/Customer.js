/**
 * Customer
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    customer_id: {
      type: "integer",
    },
    email: {
      type: "email",
      required: true
    },
    firstname: {
      type: "string",
      required: true
    },
    lastname: {
      type: "string",
    },
    store_id: {
      type: "integer",
    },
    website_id: {
      type: "integer",
    },
    disable_auto_group_change: {
      type: "boolean",
    },
    group_id: {
      type: "integer",
    },
    updated_at: {
      type: "date",
    },
    created_at: {
      type: "date",
    },
    created_in: {
      type: "string",
    },
    password_hash: {
      type: "string"
    },
  }

};
