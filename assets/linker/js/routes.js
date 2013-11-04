jumplink.magentoweb.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/partial1', {
        templateUrl: 'partials/partial1.jade',
        //controller: 'CategoryCtrl'
      }).
      when('/products', {
        templateUrl: 'partials/products.jade',
        //controller: 'CategoryCtrl'
      }).     
      when('/products/:product_id', {
        templateUrl: 'partials/product-view.html',
        //controller: 'ProductViewCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);