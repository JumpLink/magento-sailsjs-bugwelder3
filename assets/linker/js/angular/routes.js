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
      when('/admin/user', {
        templateUrl: 'content/admin/user/index.jade',
        controller: 'UserListController'
      }).
      when('/admin/user/create', {
        templateUrl: 'content/admin/user/create.jade',
        controller: 'UserCreateController'
      }).
      when('/admin/user/signin', {
        templateUrl: 'content/admin/user/signin.jade',
        controller: 'UserSigninController'
      }).
      when('/admin/user/show/:email', {
        templateUrl: 'content/admin/user/show.jade',
        controller: 'UserShowController'
      }).
      when('/admin/user/edit/:email', {
        templateUrl: 'content/admin/user/edit.jade',
        controller: 'UserShowController'
      }).
      when('/admin/barcode-scanner', {
        templateUrl: 'content/admin/barcode-scanner.jade',
        controller: 'BarcodeScannerController'
      }).
      when('/products', {
        templateUrl: 'content/products.jade',
        controller: 'ProductController'
      }).     
      when('/products/:product_id', {
        templateUrl: 'content/product-view.jade',
        controller: 'ProductController'
      }).
      when('/site-notice', {
        templateUrl: 'content/site_notice.jade'
      }).   
      otherwise({
        redirectTo: '/'
      });
  }]);