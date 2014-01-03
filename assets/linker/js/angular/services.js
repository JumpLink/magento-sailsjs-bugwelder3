jumplink.magentoweb.factory("NavbarService", function() {

});

jumplink.magentoweb.factory("FilterService", function() {

  /**
   * Converts an object into a key/value par with an optional prefix.
   * Used for converting objects to a query string.
   * Irgnore empty strings and 'any'
   * Source: https://gist.github.com/jonmaim/4239779
   */
  var filterQueryString = function(obj, prefix){
    var str = [];
    for (var p in obj) {
      var k = prefix ? prefix + "[" + p + "]" : p;
          v = obj[k];
      if(obj[k] != 'any' && obj[k] != '') {
        str.push(angular.isObject(v) ? filterQueryString(v, k) : (k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }

  return {
    queryString : filterQueryString
  }

});

jumplink.magentoweb.factory("MagentoProductService", function($sails) {
  var getConfig = function (callback) {
    $sails.get("/config", function (config) {
      callback(null, config[0]);
    });
  }
  var getMagentoProductList = function (querystring, callback) {
    getConfig (function (error, config) {
      var url = null;
      if(config.magento_product_cache_on === true) {
        url = "/productcache?"+querystring;
        console.log("Get Magento Product List from Cache");
      } else {
        url = "/product"; // TODO querystring
        console.log("Get Magento Product List Direct");
      }
      $sails.get(url, function (response) {
        if(response != null && typeof(response[0]) !== "undefined" && typeof(response[0].id) !== "undefined") {
          callback(null, response);
        } else {
          callback("Can't load products", response);
        }
      });
    });
  }
  var getMagentoProductInfo = function (querystring, callback) {
    getConfig (function (error, config) {
      var url = null;
      if(config.magento_product_cache_on === true) {
        url = "/productcache"+querystring;
        console.log("Get Magento Product Info from Cache");
      } else {
        url = "/product"+querystring;
        console.log("Get Magento Product Info Direct");
      }
      $sails.get(url, function (response) {
        console.log("response");
        console.log(response);
        if (response instanceof Array)
          response = response[0]
        if(typeof(response.id) !== "undefined") {
          callback(null, response);
        } else {
          callback("Can't load product", response);
        }
      });
    });
  }
  return {
    getList : getMagentoProductList
    , getInfo : getMagentoProductInfo
  }
});

jumplink.magentoweb.factory("VWHProductService", function($sails) {
  var getConfig = function (callback) {
    $sails.get("/config", function (config) {
      callback(null, config[0]);
    });
  }
  var getVWHProductList = function (querystring, callback) {
    getConfig (function (error, config) {
      var url = null;
      if(config.vwh_product_cache_on === true) {
        url = "/vwhproductcache"+querystring;
        console.log("Get VWH Product List from Cache");
      } else {
        url = "/vwhproduct"; // TODO querystring
        console.log("Get VWH Product List Direct");
      }
      $sails.get(url, function (response) {
        if(response != null && typeof(response[0]) !== "undefined" && typeof(response[0].id) !== "undefined") {
          callback(null, response);
        } else {
          callback("Can't load products", response);
        }
      });
    });
  }
  var getVWHProductInfo = function (querystring, callback) {
    getConfig (function (error, config) {
      var url = null;
      if(config.vwh_product_cache_on === true) {
        url = "/vwhproductcache"+querystring;
        console.log("Get VWH Product Info from Cache");
      } else {
        url = "/vwhproduct"+querystring;
        console.log("Get VWH Product Info Direct");
        console.log(url);
      }
      $sails.get(url, function (response) {
        console.log("response");
        console.log(response);
        if (response instanceof Array)
          response = response[0]
        if(typeof(response.id) !== "undefined") {
          callback(null, response);
        } else {
          callback("Can't load product", response);
        }
      });
    });
  }
  return {
    getList : getVWHProductList
    , getInfo : getVWHProductInfo
  }
});

jumplink.magentoweb.factory("SessionService", function() {
  return {
    get: function(key) {
      return sessionStorage.getItem(key);
    },
    set: function(key, val) {
      return sessionStorage.setItem(key, val);
    },
    unset: function(key) {
      return sessionStorage.removeItem(key);
    },
  };
});

jumplink.magentoweb.factory("AuthenticationService", function($http, $sanitize, $sails, SessionService, NotifyService, CSRF_TOKEN) {
  
  var cacheSession = function(data) {

    if(typeof(data._id) === "undefined")
      data._id = data.id;

    SessionService.set('authenticated', true);
    SessionService.set('name', data.name);
    SessionService.set('email', data.email);
    SessionService.set('color', data.color);
    SessionService.set('_id', data._id);
  };

  var uncacheSession = function() {
    SessionService.unset('authenticated');
    SessionService.unset('name');
    SessionService.unset('email');
    SessionService.unset('color');
    SessionService.unset('_id');
  };

  var loginError = function(response) {
    //NotifyService.show_response(response);
    NotifyService.show("Error", response, "danger");
  };

  var sanitizeCredentials = function(credentials) {
    return {
      email: $sanitize(credentials.email),
      password: $sanitize(credentials.password),
      _id: $sanitize(credentials._id),
      _csrf: CSRF_TOKEN
    }
  };

  var getUser = function() {
    return {
      name: SessionService.get('name'),
      email: SessionService.get('email'),
      color: SessionService.get('color'),
      _id: SessionService.get('_id')
    }
  }

  return {
    signin: function(credentials, cb) {
      var sanitized_credentials = sanitizeCredentials(credentials);
      $sails.post("/session", sanitized_credentials, function (response) {
        if(response.authenticated === true) {
          cacheSession (response.user);
          cb(true, response.user);
        } else {
          NotifyService.show("Error", response, "danger");
          cb(false, null);
        }
      });      
    },

    signout: function(cb) {
      var user = getUser();
      $sails.delete("/session/"+user._id, function (response) {
        if(response.authenticated === false) {
          uncacheSession ();
          cb(true);
        } else {
          NotifyService.show("Error", "Can't singn out "+user.name, "danger");
          cb(false);
        }
      });
    },

    isSignin: function() {
      return SessionService.get('authenticated');
    },
    getUser: getUser
  }
});