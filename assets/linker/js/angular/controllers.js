
jumplink.magentoweb.controller('UserCreateController', function($scope, $sails, AuthenticationService) {
  $scope.create = function () {
    $sails.post("/user", $scope.new_user, function (response) {
      console.log(response);
    });
  }

  $scope.getSigninUser = function() {
    return AuthenticationService.getUser();
  };

});

jumplink.magentoweb.controller('UserListController', function($scope, $sails) {
  var getUsers = function () {
    $sails.get("/user", function (response) {
      console.log(response);
      $scope.users = response;
    });
  }

  getUsers();
});

jumplink.magentoweb.controller('UserShowController', function($scope, $sails, $routeParams, NotifyService) {

  $scope.user = {
    email: $routeParams.email
  }

  var getUser = function () {
    $sails.get("/user?email="+$scope.user.email, function (response) {
      console.log("get user in UserShowController ");
      console.log(response);
      $scope.user = response[0];
    });
  }

  $scope.update = function () {
    var user = $scope.user;
    $sails.put("/user/"+user.id, user, function (response) {
      console.log(response);
      NotifyService.show("Saved", "User "+user.name+" saved", "info");
    });
  }

  getUser();
});

jumplink.magentoweb.controller('UserSigninController', function($scope, $location, NotifyService, AuthenticationService) {
  $scope.signin = function () {
    AuthenticationService.signin ($scope.user, function (success, user) {
      if(success) {
        $location.path( "/admin" );
        NotifyService.show("Signin", "User "+user.name+" is signed in", "info");
      }
    });
   }
});

jumplink.magentoweb.controller('TryController', function($scope, NotifyService) {
  $scope.notify_show = function (try_notify) {
    NotifyService.show(try_notify.title, try_notify.message, try_notify.type);
  }
});

jumplink.magentoweb.controller('ProductConfigController', function($scope, $sails, NotifyService) {
  $scope.generateAttributes = function () {
    $sails.get("/product/generateAttributes", function (response) {
      if(response.status === 500) {
        NotifyService.show("Can't generate product attributes", response, "error");
      } else {
        NotifyService.show("Product attributes generated", "", "success");
      }
    });
  }
});

jumplink.magentoweb.controller('ProductListController', function($rootScope, $scope, $sails, NotifyService) {
  if(typeof($rootScope.magento_products) === 'undefined' || !$rootScope.magento_products.length)
    $sails.get("/productcache", function (response) {
      console.log(response);
      if(response != null && typeof(response[0]) !== "undefined" && typeof(response[0].id) !== "undefined") {
        $rootScope.magento_products = response;
        NotifyService.show("Products loaded", "", "success");
      } else {
        NotifyService.show("Can't load products", response, "error");
      }
    });
});

jumplink.magentoweb.controller('ProductInfoController', function($scope, $sails, $routeParams, NotifyService) {

  $scope.search = {
    action : "SKU",
    value : ""
  };

  $scope.reset = function () {
    $scope.search.value = "";
    $scope.product = {};
  }

  $scope.get = function () {
    var url = "/productcache";
    var action = $scope.search.action;
    switch (action) {
      case "SKU":
        url += "?sku="+$scope.search.value;
      break;
      case "ID":
        url += "/"+$scope.search.value;
      break;
    }
    console.log("get by "+$scope.search.action);
    $sails.get(url, function (response) {
      console.log("response");
      console.log(response);
      if (action !== 'ID' && response instanceof Array)
        response = response[0]

      if(typeof(response.id) !== "undefined") {
        $scope.product = response;
        NotifyService.show("Product loaded", "Product Name: "+$scope.product.name, "success");
      } else {
        NotifyService.show("Can't load product", response, "error");
      }
    });
  }

  $scope.save = function () {
    console.log("save barcode");

    var total_qty = $scope.product.stock_strichweg_qty+$scope.product.stock_vwheritage_qty
    var is_in_stock = (total_qty > 0) ? 1 : 0;
    var product_data = {
      stock_data : {
        qty: total_qty,
        use_config_manage_stock: 1,
        is_in_stock: is_in_stock
      },
      set : {
        set_id: $scope.product.set.set_id
      },
      stock_strichweg_qty: $scope.product.stock_strichweg_qty,
      stock_vwheritage_qty: $scope.product.stock_vwheritage_qty,
      stock_strichweg_range: $scope.product.stock_strichweg_range,
      stock_strichweg_row: $scope.product.stock_strichweg_row
    }

    console.log(product_data);

    $sails.put("/product/"+$scope.product.id, product_data, function (response) {
      if(typeof(response.id) !== "undefined") {
        NotifyService.show("Product saved", "Product ID: "+response.id, "success");
      } else {
        NotifyService.show("Product not saved", response, "error");
      }
    });
  }

  // If id is passed in the url
  if(typeof($routeParams.id) !== "undefined") {
    $scope.search.value = $routeParams.id;
    $scope.search.action = "ID";
    $scope.get ();
  }

});

jumplink.magentoweb.controller('ProductVWHeritageListController', function($rootScope, $scope, $sails, NotifyService) {
  if(typeof($rootScope.extern_products) === 'undefined' || !$rootScope.extern_products.length)
    $sails.get("/vwhproductcache", function (response) {
      console.log(response);
      if(response != null && typeof(response[0].id) !== "undefined") {
        $rootScope.extern_products = response;
        NotifyService.show("Products loaded", "", "success");
      } else {
        NotifyService.show("Can't load products", response, "error");
      }
    });

});

jumplink.magentoweb.controller('ProductVWHeritageInfoController', function($scope, $sails, $routeParams, NotifyService) {

  $scope.search = {
    action : "ID",
    value : ""
  };

  $scope.get = function () {
    console.log("get vwheritage");
    $sails.get("/vwhproductcache/"+$scope.search.value+"&limit=1", function (product) {
      
      if(typeof(product.id) === "undefined") {
        NotifyService.show("Can't load product", product, "error");
      } else {
        $scope.product = product;
        
        $sails.get("/vwhimage/"+$scope.product.id+"?limit=1", function (images) {
          console.log(images);
          NotifyService.show("Product loaded", "Product Name: "+$scope.product.name, "success");
          $scope.product.images = images;
        });

      }
    });
  }

  // If id is passed in the url
  if(typeof($routeParams.id) !== "undefined") {
    $scope.search.value = $routeParams.id;
    $scope.search.action = "ID";
    $scope.get ();
  }

});

jumplink.magentoweb.controller('ProductCompareListController', function($rootScope, $scope, $sails, NotifyService) {

  var getMagentoProducts = function (cb) {
    if(typeof($rootScope.magento_products) === 'undefined' || !$rootScope.magento_products.length)
      $sails.get("/product", function (response) {
        if(response != null && typeof(response[0].id) !== "undefined") {
          cb (null, response);
        } else {
          cb ("Can't load magento products", null);
        }
      });
    else
      cb (null, $rootScope.magento_products);
  }
  
  var getExternProducts = function (cb) {
    if(typeof($rootScope.extern_products) === 'undefined' || !$rootScope.extern_products.length)
      $sails.get("/vwhproductcache", function (response) {
        if(response != null && typeof(response[0].id) !== "undefined") {
          cb (null, response);
        } else {
          cb ("Can't load extern products", null);
        }
      });
        else
      cb (null, $rootScope.extern_products);
  }

  var getProducts = function (final_callback) {
    async.parallel([
      getMagentoProducts,
      getExternProducts
    ], function(err, results) {
      if(!err) {
        // console.log(results);
        $rootScope.magento_products = results[0];
        $rootScope.extern_products = results[1];
        //NotifyService.show("All products loaded", "", "success");
        final_callback(null, $rootScope.magento_products, $rootScope.extern_products);
      } else {
        console.log(err);
        // NotifyService.show("Can't load products", err, "error");
        final_callback(err, null);
      }
    });
  }

  var difference = function (a, b) {
    // Make hashtable of ids in B
    var b_skus = {}
    b.forEach(function(obj){
        b_skus[obj.sku] = obj;
    });

    // Return all elements in A, unless in B
    return a.filter(function(obj){
        return !(obj.sku in b_skus);
    });
  }

  var getDifference = function (magento_products, extern_products, final_callback) {
    var error = null;
    $rootScope.magento_only_products = difference(magento_products, extern_products);
    $rootScope.extern_only_products = difference(extern_products, magento_products);
    final_callback (error, $rootScope.magento_only_products, $rootScope.extern_only_products);
  }

  async.waterfall([
    getProducts,
    getDifference,
  ], function(err, results){
    if (!err) {
      NotifyService.show("All products and differences loaded", "", "success");
    } else {
      NotifyService.show("Can't load products", err, "error");
    }
  });


});

jumplink.magentoweb.controller('ProductCompareInfoController', function($scope, $sails, $routeParams, NotifyService) {

  $scope.search = {
    action : "ID",
    value : ""
  };

  $scope.get = function () {
    console.log("get vwheritage");
    $sails.get("/vwhproductcache?id="+$scope.search.value+"&limit=1", function (product) {
      
      if(typeof(product.id) === "undefined") {
        NotifyService.show("Can't load product", product, "error");
      } else {
        $scope.product = product;
        
        $sails.get("/vwhimage/"+$scope.product.id+"?limit=1", function (images) {
          console.log(images);
          NotifyService.show("Product loaded", "Product Name: "+$scope.product.name, "success");
          $scope.product.images = images;
        });

      }
    });
  }

  // If id is passed in the url
  if(typeof($routeParams.id) !== "undefined") {
    $scope.search.value = $routeParams.id;
    $scope.search.action = "ID";
    $scope.get ();
  }

});

jumplink.magentoweb.controller('CacheController', function($scope, NotifyService) {

});

jumplink.magentoweb.controller('LogController', function($scope, $sails, $http, NotifyService) {

  $scope.filter.error = 'any';
  $scope.filter.model = 'any';
  $scope.filter.service = 'any';
  $scope.filter.action = 'any';
  $scope.filter.status = 'any';
  $scope.filter.limit = 100;
  $scope.search = '';


  /**
   * Converts an object into a key/value par with an optional prefix.
   * Used for converting objects to a query string.
   * Irgnore empty strings and 'any'
   * Source: https://gist.github.com/jonmaim/4239779
   */
  var qs = function(obj, prefix){
    var str = [];
    for (var p in obj) {
      var k = prefix ? prefix + "[" + p + "]" : p;
          v = obj[k];
      if(obj[k] != 'any' && obj[k] != '') {
        str.push(angular.isObject(v) ? qs(v, k) : (k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }

  $scope.getLogs = function () {

    var querystring = qs($scope.filter, null);

    $sails.get("/log?"+querystring, function (response) {
      $scope.logs = response;
    });
  }

  $scope.destroyAll = function () {
    $sails.get("/log", function (response) {
      delete $scope.logs;
    });
  }

  $scope.logFilter = function(log) {
    var is_equals = true;

    if(typeof($scope.filter.error) !== 'undefined' && $scope.filter.error !== '' && $scope.filter.error !== 'any')
      if(typeof(log.error) === 'undefined' || $scope.filter.error !== log.error.toString())
        is_equals = false;

    if(typeof($scope.filter.model) !== 'undefined' && $scope.filter.model !== '' && $scope.filter.model !== 'any')
      if(typeof(log.model) === 'undefined' || $scope.filter.model !== log.model)
        is_equals = false;

    if(typeof($scope.filter.service) !== 'undefined' && $scope.filter.service !== '' && $scope.filter.service !== 'any')
      if(typeof(log.service) === 'undefined' || $scope.filter.service !== log.service)
        is_equals = false;

    if(typeof($scope.filter.action) !== 'undefined' && $scope.filter.action !== '' && $scope.filter.action !== 'any')
      if(typeof(log.action) === 'undefined' || $scope.filter.action !== log.action)
        is_equals = false;

    if(typeof($scope.filter.status) !== 'undefined' && $scope.filter.status !== '' && $scope.filter.status !== 'any')
      if(typeof(log.status) === 'undefined' || $scope.filter.status !== log.status)
        is_equals = false;

    return is_equals;
  };

  $scope.getLogs();
  
});