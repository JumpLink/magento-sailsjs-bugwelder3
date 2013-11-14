jumplink.magentoweb.controller('TryController', function($scope, NotifyService) {
  $scope.notify_show = function (try_notify) {
    NotifyService.show(try_notify.title, try_notify.message, try_notify.type);
  }
});

jumplink.magentoweb.controller('BarcodeScannerController', function($scope, $sails, NotifyService) {
  $scope.get = function () {
    console.log("get barcode");
    $sails.get("/product?sku="+$scope.barcode.sku+"&limit=1", function (data) {
      console.log(data);
      $scope.product = data[0];
    });
  }
});
