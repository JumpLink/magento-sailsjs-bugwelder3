jumplink.magentoweb.factory("ProductService", function($sails) {
  $sails.get("/product/5", function (data) {
      console.log(data);
      //$scope.bars = data;
    });
});