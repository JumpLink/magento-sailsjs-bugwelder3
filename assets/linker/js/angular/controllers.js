jumplink.magentoweb.controller('TryController', function($scope, NotifyService) {
  $scope.notify_show = function (try_notify) {
    NotifyService.show(try_notify.title, try_notify.message, try_notify.type);
  }
});

jumplink.magentoweb.controller('BarcodeScannerController', function($scope, $sails, NotifyService) {
  $scope.get = function () {
    console.log("get barcode");
    $sails.get("/product?sku="+$scope.barcode.sku+"&limit=1", function (response) {
      console.log(response);
      $scope.product = response[0];
    });
  }
  $scope.save = function () {
    console.log("save barcode");

    var total_qty = $scope.product.stock_strichweg_qty.value+$scope.product.stock_vwheritage_qty.value
    var is_in_stock = (total_qty > 0) ? 1 : 0;
    var product_data = {
      stock_data : {
        qty: total_qty,
        use_config_manage_stock: 1,
        is_in_stock: is_in_stock
      },
      stock_strichweg_qty: $scope.product.stock_strichweg_qty.value,
      stock_vwheritage_qty: $scope.product.stock_vwheritage_qty.value
    }

    console.log(product_data);

    $sails.put("/product/"+$scope.product.id, product_data, function (response) {
      console.log(response);
    });
  }
});
