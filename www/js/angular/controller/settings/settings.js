app.controller('SettingsCtrl', function($scope,$translate,$state) {
    $scope.initVar = function() {
        $scope.currency = currency_label_g;
    };

    $scope.goTo = function(stateName) {
        $state.go("tabs.home.settings." + stateName);
    };
});

