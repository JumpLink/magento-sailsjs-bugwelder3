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
      when('/admin/product/list', {
        templateUrl: 'content/admin/product/list.jade',
        controller: 'ProductListController'
      }).
      when('/admin/product/info', {
        templateUrl: 'content/admin/product/info.jade',
        controller: 'ProductInfoController'
      }).
      when('/admin/product/info/:id', {
        templateUrl: 'content/admin/product/info.jade',
        controller: 'ProductInfoController'
      }).
      when('/admin/product/vwheritage-list', {
        templateUrl: 'content/admin/product/vwheritage-list.jade',
        controller: 'ProductVWHeritageListController'
      }).
      when('/admin/product/vwheritage-info', {
        templateUrl: 'content/admin/product/vwheritage-info.jade',
        controller: 'ProductVWHeritageInfoController'
      }).
      when('/admin/product/vwheritage-info/:id', {
        templateUrl: 'content/admin/product/vwheritage-info.jade',
        controller: 'ProductVWHeritageInfoController'
      }).
      when('/admin/product/compare-list', {
        templateUrl: 'content/admin/product/compare-list.jade',
        controller: 'ProductCompareListController'
      }).
      when('/admin/product/compare-info', {
        templateUrl: 'content/admin/product/compare-info.jade',
        controller: 'ProductCompareInfoController'
      }).
      when('/admin/product/compare-info/:sku', {
        templateUrl: 'content/admin/product/compare-info.jade',
        controller: 'ProductCompareInfoController'
      }).
      when('/admin/product/config', {
        templateUrl: 'content/admin/product/config.jade',
        controller: 'ProductConfigController'
      }).
      when('/admin/cache', {
        templateUrl: 'content/admin/cache.jade',
        controller: 'CacheController'
      }).
      when('/admin/log', {
        templateUrl: 'content/admin/log.jade',
        controller: 'LogController'
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