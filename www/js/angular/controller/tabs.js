app.controller('TabsCtrl', function($scope,$state) {
    $scope.homeClick = function() {
        if ($state.current.name !== "tabs.home") {
            $state.go("tabs.home");
        } else {
            $("#home_view").scope().detriggerClientSearch();
        }
    }
});

