app.controller('SettingsCtrl', ['$scope', '$translate', '$state', function($scope,$translate,$state) {
    $scope.initVar = function() {
        $scope.currency = currency_label_g;
    };

    $scope.goToEditFields = function() {
        $state.go("tabs.home.settings.customizeFieldNames");
    };
    $scope.goToChangePassword = function() {
        $state.go("tabs.home.settings.changePassword");
    };
    $scope.goToChangeEmail = function() {
        $state.go("tabs.home.settings.changeEmail");
    };
}]);

