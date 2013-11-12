jumplink.magentoweb.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/try', {
        templateUrl: 'content/try.jade',
        controller: 'TryController'
      }).
      when('/admin', {
        templateUrl: 'content/admin.jade',
        //controller: 'CategoryCtrl'
      }).
      when('/admin/signin', {
        templateUrl: 'content/admin/signin.jade',
        //controller: 'CategoryCtrl'
      }).
      when('/products', {
        templateUrl: 'content/products.jade',
        //controller: 'CategoryCtrl'
      }).     
      when('/products/:product_id', {
        templateUrl: 'content/product-view.jade',
        //controller: 'ProductViewCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);