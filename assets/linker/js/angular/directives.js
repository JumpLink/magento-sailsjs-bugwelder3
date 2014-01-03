jumplink.magentoweb.directive("navbar", [function () {
  return {
    restrict: "E",
    scope: {
      mode: "@"
    },
    templateUrl: 'partials/navbar.jade',
    controller: 'NavbarController'
  }
}]);

jumplink.magentoweb.directive("repeatChangedEvent", [function () {
  console.log('RepeatUpdateScroll');
  return function(scope, element, attrs) {
    //console.log(scope);
    if (scope.$last) { // all are rendered
      scope.$emit('repeatChanged'); // IMPORTANT: This works only if the limit-filter will be longer but not of the limit-filter will be smaler
    }    
  };
}]);

