/**
 * Product
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  adapter: 'magento-dnode',

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    stock_data: {
      type: "array"
    }
    stock_strichweg_qty: {
       type: "integer"
    }
    stock_vwheritage_qty: {
       type: "integer"
    }
  }

};
