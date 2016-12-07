app.controller('SettingsCtrl', function($scope,$translate,$state,credentialManager) {
    $scope.initVar = function() {
        $scope.currency = currency_label_g;
    };

    $scope.goTo = function(stateName) {
        if (stateName === 'reportType' || stateName === 'customizeFieldNames') {
            if (credentialManager.getSubscription().type === 0 || credentialManager.getSubscription().type === 1) {
                credentialManager.showUpgradeAccountModal();
            } else {
                $state.go("tabs.home.settings." + stateName);
            }
        } else {
            $state.go("tabs.home.settings." + stateName);
        }
    };
});

