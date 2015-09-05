app.controller('SettingsCtrl', function($scope,$translate,$state) {
    $scope.initVar = function() {
        $scope.currency = currency_label_g;
    };

    $scope.goToEditFields = function() {
        $state.go("tabs.home.settings.customizeFieldNames");
    };
});

