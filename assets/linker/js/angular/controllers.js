
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

jumplink.magentoweb.controller('ProductListController', function($scope, $sails, NotifyService) {



});

jumplink.magentoweb.controller('ProductInfoController', function($scope, $sails, NotifyService) {

  $scope.search = {
    action : "SKU",
    value : ""
  };

  $scope.reset = function () {
    $scope.search.value = "";
    $scope.product = {};
  }

  $scope.get = function () {
    var url = "/product";
    var action = $scope.search.action;
    switch (action) {
      case "SKU":
        url += "?sku="+$scope.search.value+"&limit=1";
      break;
      case "ID":
        url += "?id="+$scope.search.value+"&limit=1";
      break;
    }
    console.log("get by "+$scope.search.action);
    $sails.get(url, function (response) {

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
});

jumplink.magentoweb.controller('ProductVWHeritageInfoController', function($scope, $sails, $routeParams, NotifyService) {

  $scope.search = {
    action : "ID",
    value : ""
  };

  $scope.get = function () {
    console.log("get vwheritage");
    $sails.get("/vwheritageproduct?id="+$scope.search.value+"&limit=1", function (product) {
      
      if(typeof(product.id) === "undefined") {
        NotifyService.show("Can't load product", product, "error");
      } else {
        $scope.product = product;
        
        $sails.get("/vwheritageimage/"+$scope.product.id+"?limit=1", function (images) {
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

jumplink.magentoweb.controller('ProductVWHeritageListController', function($scope, $sails, NotifyService) {

  $sails.get("/vwheritageproduct", function (response) {
    console.log(response);
    if(typeof(response[0].id) !== "undefined") {
      $scope.products = response;
      NotifyService.show("Products loaded", "", "success");
    } else {
      NotifyService.show("Can't load products", response, "error");
    }
  });

});

jumplink.magentoweb.controller('CacheController', function($scope, NotifyService) {

});