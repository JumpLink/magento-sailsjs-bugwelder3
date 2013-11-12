/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  adapter: 'mongo',

  attributes: {
    email: {
      type: "email",
      required: true,
      unique: true
    },
    name: {
      type: "string",
      required: true
    },
    encryptedPassword: {
      type: "string",
      required: true
    }
  }
};