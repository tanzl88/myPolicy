app.controller('UpgradeAccountCtrl', ['$scope', 'storeService', function($scope,storeService) {

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
    });

    $scope.initVar = function() {

    };

    $scope.upgradeAccount = function(product_id) {
        storeService.order(product_id);
    }

}]);