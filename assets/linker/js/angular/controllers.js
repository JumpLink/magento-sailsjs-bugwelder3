
jumplink.magentoweb.controller('NavbarController', function($scope, $location, NotifyService, AuthenticationService) {
  $scope.getSigninUser = function() {
    return AuthenticationService.getUser();
  };

  $scope.signout = function () {
    AuthenticationService.signout (function signed_out (success) {
      if(success === true) {
        $location.path( "/admin" );
        NotifyService.show("Signout", "You are signed out", "info");
        $scope.$apply(); // I don't why I need this here but not on signin, maybe because this is an own module
      }
    });
   }
});

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
    $sails.get("/product/saveAttributes", function (response) {
      if(response.status === 500) {
        NotifyService.show("Can't generate product attributes", response, "error");
      } else {
        NotifyService.show("Product attributes generated", "", "success");
      }
    });
  }
  $scope.importVWHProductsToCache = function () {
    $sails.get("/vwhproductcache/import", function (response) {
      if(response.status === 500 || response.status === 404) {
        NotifyService.show("Can't import VWHProducts to cache", response, "error");
      } else {
        NotifyService.show("VWHProducts imported", "", "success");
      }
    });
  }
  $scope.importMagentoProductsToCache = function () {
    $sails.get("/productcache/import", function (response) {
      if(response.status === 500 || response.status === 404) {
        NotifyService.show("Can't import MagentoProducts to cache", response, "error");
      } else {
        NotifyService.show("MagentoProducts imported", "", "success");
      }
    });
  }
});

jumplink.magentoweb.controller('ProductListController', function($rootScope, $scope, $sails, NotifyService, FilterService, MagentoProductService) {

  $scope.filter.status = 'any';
  $scope.filter.type = 'any';
  $scope.filter.limit = 20000;
  $scope.client_limit = 20;
  $scope.search = '';
  $scope.sortReverse = true;
  $scope.sortingOrder = 'sku';
  $scope.selectedShowTable = ["sku", "name"]; // default selected

  $scope.$watch('selectedShowTable', function(nowSelected){
    console.log($scope.selectedShowTable);
  });

  $scope.selectedShowTableContains = function (value) {
    return _.contains($scope.selectedShowTable, value);
  }

  // Defines additional options such as onScrollEnd and other runtime settings
  // exposed by iScroll can be defined per id attribute
  $scope.$parent.myScrollOptions = {
    'iscroll-wrapper': {
      snap: false
      , scrollbars: true
      , mouseWheel: true
      , interactiveScrollbars: true
      , shrinkScrollbars: 'scale'
      , fadeScrollbars: true
      , keyBindings: true
      , click: true
    }
  };

  // expose refreshiScroll() function for ng-onclick or other meth
  $scope.refreshiScroll = function () {
    if(typeof($scope.$parent.myScroll) !== 'undefined')
      $scope.$parent.myScroll['iscroll-wrapper'].refresh();
    else
      console.log("iScroll not ready");
  };

  $scope.$on('repeatChanged', function(event) {
    console.log("try to refresh scrollbar");
    $scope.refreshiScroll();
  });

  // change sorting order
  $scope.sort_by = function(newSortingOrder) {
    if ($scope.sortingOrder == newSortingOrder)
      $scope.sortReverse = !$scope.sortReverse;
    $scope.sortingOrder = newSortingOrder;
  }

  $scope.productFilter = function(product) {
    var is_equals = true;

    if(typeof($scope.filter.status) !== 'undefined' && $scope.filter.status !== '' && $scope.filter.status !== 'any')
      if(typeof(product.status) === 'undefined' || $scope.filter.status !== product.status.toString())
        is_equals = false;

    if(typeof($scope.filter.type) !== 'undefined' && $scope.filter.type !== '' && $scope.filter.type !== 'any')
      if(typeof(product.type) === 'undefined' || $scope.filter.type !== product.type.toString())
        is_equals = false;

    return is_equals;
  };

  $scope.getProducts = function () {
    var querystring = FilterService.queryString($scope.filter, null);
    //console.log("/productcache?"+querystring);
    MagentoProductService.getList(querystring, function (error, response) {
    //$sails.get("/productcache?"+querystring, function (response) {
      if(!error) {
        $rootScope.magento_products = response;
        NotifyService.show("Products loaded", "", "success");
      } else {
        NotifyService.show("Can't load products", error, "error");
      }
    });
  }

  // get products automatic on view only if the products currently not loaded
  if(typeof($rootScope.magento_products) === 'undefined' || !$rootScope.magento_products.length) {
    $scope.getProducts();
  }

});

jumplink.magentoweb.controller('ProductInfoController', function($scope, $sails, $routeParams, NotifyService, MagentoProductService) {

  $scope.search = {
    action : "SKU",
    value : ""
  };

  $scope.reset = function () {
    $scope.search.value = "";
    $scope.product = {};
  }

  $scope.get = function () {
    var querystring = "";
    var action = $scope.search.action;
    switch (action) {
      case "SKU":
        querystring = "?sku="+$scope.search.value;
      break;
      case "ID":
        querystring = "/"+$scope.search.value;
      break;
    }
    console.log("get by "+$scope.search.action);
    MagentoProductService.getInfo(querystring, function (error, response) {
      if(!error) {
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

jumplink.magentoweb.controller('ProductVWHeritageListController', function($rootScope, $scope, $sails, NotifyService, FilterService, VWHProductService) {

  $scope.filter.limit       = 20000;
  $scope.client_limit       = 20;
  $scope.search             = '';
  $scope.sortReverse        = false;
  $scope.sortingOrder       = 'id';
  $scope.selectedShowTable  = ["sku", "name"]; // default selected

  // change sorting order
  $scope.sort_by = function(newSortingOrder) {
    if ($scope.sortingOrder == newSortingOrder)
      $scope.sortReverse = !$scope.sortReverse;

    $scope.sortingOrder = newSortingOrder;
  }

  $scope.selectedShowTableContains = function (value) {
    return _.contains($scope.selectedShowTable, value);
  }

  $scope.getProducts = function () {

    var querystring = "?"+FilterService.queryString($scope.filter, null);
    console.log("/vwhproductcache"+querystring);

    //$sails.get("/vwhproductcache?"+querystring, function (response) {
    VWHProductService.getList (querystring, function (error, response) {
      //console.log(response);
      if(!error) {
        $rootScope.extern_products = response;
        NotifyService.show("Products loaded", "", "success");
      } else {
        NotifyService.show("Can't load products", error, "error");
      }
    });
  }

  $scope.destroyAll = function () {
    console.log("Error: Not implemented!");
  }

  $scope.productFilter = function(product) {
    var is_equals = true;

    // TODO

    return is_equals;
  };

  if(typeof($rootScope.extern_products) === 'undefined' || !$rootScope.extern_products.length)
    $scope.getProducts();

});

jumplink.magentoweb.controller('ProductVWHeritageInfoController', function($scope, $sails, $routeParams, NotifyService, VWHProductService) {

  $scope.search = {
    action : "ID",
    value : ""
  };

  $scope.get = function () {
    console.log("get vwheritage");
    var querystring = "/"+$scope.search.value+"?limit=1";
    VWHProductService.getInfo (querystring, function (error, response) {
    //$sails.get("/vwhproductcache/"+$scope.search.value+"&limit=1", function (product) {
      if(error) {
        NotifyService.show("Can't load product", response, "error");
      } else {
        $scope.product = response;
        
        $sails.get("/vwhimage/"+$scope.product.id+"?limit=1", function (images) { // TODO
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
    $sails.get("/productcache", function (response) {
      if(response != null && typeof(response[0].id) !== "undefined") {
        $rootScope.magento_products = response;
        cb (null, $rootScope.magento_products);
      } else {
        cb ("Can't load magento products", null);
      }
    });
  }
  
  var getExternProducts = function (cb) {
    $sails.get("/vwhproductcache", function (response) {
      if(response != null && typeof(response[0].id) !== "undefined") {
        $rootScope.extern_products = response;
        cb (null, $rootScope.extern_products);
      } else {
        cb ("Can't load extern products", null);
      }
    });
  }

  var getProductsIfNotLoaded = function (final_callback) {
    async.parallel([
      function getMagentoProductsIfNotLoaded (callback) {
        if(typeof($rootScope.magento_products) === 'undefined' || !$rootScope.magento_products.length)
          getMagentoProducts(callback);
        else {
          console.log("Magento Products already loaded");
          callback (null, $rootScope.magento_products);
        }
      }
      , function getExternProductsIfNotLoaded (callback) {
        if(typeof($rootScope.extern_products) === 'undefined' || !$rootScope.extern_products.length)
          getExternProducts(callback);
        else {
          console.log("Extern Products already loaded");
          callback (null, $rootScope.extern_products);
        }
      }
    ], function(err, results) {
      if(!err) {
        final_callback(null, $rootScope.magento_products, $rootScope.extern_products);
      } else {
        console.log(err);
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
    getProductsIfNotLoaded
    , getDifference
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

jumplink.magentoweb.controller('ConfigController', function($scope, $rootScope, $sails, NotifyService) {

  $rootScope.getConfig = function () {
    console.log("get config");
    $sails.get("/config", function (config) {
      $rootScope.config = config[0];
      //console.log($rootScope.config);
    });
  }

  $rootScope.getConfig();

   $scope.$watch('config', function(newVal) {
      if(newVal && newVal.id) {
        console.log("update config");
        //console.log(newVal);
        $sails.put("/config/"+newVal.id, newVal, function (config) {
          //console.log(config);
        });
      } else {
        console.log("No ID!");
      }
   }, true); // true because config is an object

});

jumplink.magentoweb.controller('LogController', function($scope, $sails, $http, NotifyService, FilterService) {

  $scope.filter.error = 'any';
  $scope.filter.model = 'any';
  $scope.filter.service = 'any';
  $scope.filter.action = 'any';
  $scope.filter.status = 'any';
  $scope.filter.limit = 20000;
  $scope.client_limit = 20;
  $scope.search = '';
  $scope.sortReverse = true;
  $scope.sortingOrder = 'updated';

  // change sorting order
  $scope.sort_by = function(newSortingOrder) {
    if ($scope.sortingOrder == newSortingOrder)
      $scope.sortReverse = !$scope.sortReverse;

    $scope.sortingOrder = newSortingOrder;
  }

  $scope.getLogs = function () {

    var querystring = FilterService.queryString($scope.filter, null);
    console.log("/log?"+querystring);

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