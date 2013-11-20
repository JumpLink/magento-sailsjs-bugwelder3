jumplink.magentoweb.run(function($rootScope, $location, AuthenticationService, NotifyService) {

  var routesThatRequireAuth = ['/admin', '/admin/user', '/admin/user/create', '/admin/user/show/*', '/admin/user/edit/*', '/admin/barcode-scanner',  ]; // TODO regex, filter, whitelist or basedomain

  var routesAllowed = ['/admin/user/signin'];

  $rootScope.getUser = AuthenticationService.getUser;

  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    if( _(routesThatRequireAuth).contains($location.path()) && !AuthenticationService.isSignin() ) {
      $location.path('/admin/user/signin');
      NotifyService.show("Error", "Please log in to continue", "danger");
    }
  });
});