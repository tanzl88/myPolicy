app.controller('TabsCtrl', ['$scope', '$state', '$timeout', '$ionicScrollDelegate', function($scope,$state,$timeout,$ionicScrollDelegate) {
    $scope.homeClick = function() {
        //HIDE CHART ANNOTATION
        $("#divCursor").hide();

        if ($state.current.name !== "tabs.home") {
            $state.go("tabs.home");
        } else {
            $("#home_view").scope().detriggerClientSearch();
        }
    };

    var scrollObj = {
        profile     : "clientProfileScroll",
        list        : "policiesListScroll",
        overview    : "overview",
        report      : "report"
    };

    $scope.scrollClick = function(currentState) {
        //HIDE CHART ANNOTATION
        $("#divCursor").hide();

        var stateNameSplit = $state.current.name.split(".");
        var stateName = stateNameSplit[stateNameSplit.length - 1];
        if (currentState === stateName) {
            $timeout(function(){
                $ionicScrollDelegate.$getByHandle(scrollObj[currentState]).scrollTop(true);
            },100);
        } else {
            $state.go("tabs." + currentState);
            $timeout(function(){
                $ionicScrollDelegate.$getByHandle(scrollObj[currentState]).scrollTop();
            },100);
        }
    };
}]);

