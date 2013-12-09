/**
 * VWHeritageProductController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var arrayOfAttribute = function (object_array, attribute_name) {
  var results = [];
  object_array.forEach(function(obj){
      results.push(obj[attribute_name]);
  });
  return results;
}

var hashTableOfIds = function (array) {
  var ids = {}
  array.forEach(function(obj){
      ids[obj.id] = obj;
  });
  return ids;
}

var productExists = function (product, productList, attribute_name) {
  productList.forEach(function(current_product){
    if(current_product[attribute_name] == product[attribute_name]) {
      return true;
    }
  });
  return false;
}

var getDifferenceSync = function (a, b) {
  // Make hashtable of ids in B
  var b_ids = hashTableOfIds (b);

  // Return all elements in A, unless in B
  return a.filter(function(obj){
      return !(obj.id in b_ids);
  });
}

var getDifference = function (a, b, callback) {
  async.filter(
    a
    , function iterator (item, iterator_callback) {
      iterator_callback(!productExists(item, b, 'id'));
    }
    , callback
  );
}

var getIntersection = function (a, b, callback) {
  async.filter(
    a
    , function iterator (item, callback) {
      callback(productExists(item, b, 'id'));
    }
    , callback
  );
}

var getIntersectionSync = function (a, b) {
  var set = [];
  if (a.length > 0 && b.length > 0) {
    for (var i = 0; i < a.length; i++) {
      for (var k = 0; k < b.length; k++) {
        if (a[i].id == b[k].id) {
          set.push(a[i]);
          break;
        }
      };
    };
  }
  return set;
}

var getDublicates = function (products) {
  var set = [];
  var dubs = [];
  for (var i = 0; i < products.length; i++) {
    for (var k = 0; k < set.length; k++) {
      if (products[i].id == set[k].id) {
        dubs.push(products[i]);
      }
    };
    set.push(products[i]);
  };
  return dubs;
}

var getProductLists = function (callback) {
  async.parallel([
    function(callback) {
      VWHeritageProductCache.find().where().done(callback);
    } 
    , VWHeritageProduct.infos
  ], callback);
}

var splitProductLists = function (results, callback) {
  sails.log.info("local product length: "+results[0].length);
  sails.log.info("extern product length: "+results[1].length);
  callback(null, results[0], results[1]);
}

var updateEach = function (products, callback) {
  async.each(
    products
    , function (item, callback) {
      VWHeritageProductCache.update({id:item.id}, item, callback);
    }
    , callback
  );
}

var processEachProductLists = function (local, extern, final_callback) {

  var extern_ids = arrayOfAttribute(extern);

  // var dublicated_products = getDublicates (extern, extern);
  // sails.log.info("dublicated_products.length: "+dublicated_products.length);
  
  async.parallel([
    function createEachProduct (callback) {
      getDifference (extern, local, function(new_products) {
        sails.log.info("new_products.length: "+new_products.length);
        if(!new_products || new_products.length <= 0)
          callback(null, null);
        else
          VWHeritageProductCache.createEach(new_products, function (error, result) {
            callback (error, {new: new_products});
          });
      });
    }
    , function updateEachProduct (callback) {
      VWHeritageProductCache.find(extern_ids, function (error, updated_products) {
        sails.log.info("updated_products VWHeritageProductCache.find: "+updated_products.length);
        if(error || !updated_products || updated_products.length <= 0)
          callback(null, null);
        else
          updateEach(updated_products, function(error, result) {
            callback(error, {updated:updated_products});
          });
      });
    }
    , function destroyEachProduct (callback){ // TODO check {not: {id : extern_ids}}
      VWHeritageProductCache.find({not: {id : extern_ids}}, function (error, destroyed_products) {
        sails.log.info("destroyed products VWHeritageProductCache.find id: "+destroyed_products.length); 
        if(error || !destroyed_products || destroyed_products.length <= 0 )
          callback(null, null);
        else
          VWHeritageProductCache.destroy(destroyed_products, function(error, result) {
            callback (error, {destroyed:destroyed_products});
          });
      });
    }
  ], final_callback);
}

module.exports = {
    
  exportToCache: function (req, res) {
    async.waterfall([
      getProductLists
      , splitProductLists
      , processEachProductLists
    ], function (error, result) {
      sails.log.info("VWHeritageProduct.exportToCache done!");
      if(error) {
        sails.log.error(error);
        res.json(error, 500);
      }
      else {
        sails.log.debug(result);
        res.json(result);
      }
    });
  },

  infos: function (req, res) {
    VWHeritageProduct.infos(function (error, result) {
      if(error)
        res.json(error, 500);
      else
        res.json(result);
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to VWHeritageProductController)
   */
  _config: {}

  
};
