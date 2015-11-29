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
        //overview    : "overview",
        //report      : "report"
    };

    $scope.scrollClick = function(currentState) {
        //HIDE CHART ANNOTATION
        $("#divCursor").hide();

        $timeout(function(){
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
        },100);
    };
}]);

app.controller('ReportTabsCtrl', ['$scope', '$state', '$timeout', '$ionicScrollDelegate', function($scope,$state,$timeout,$ionicScrollDelegate) {
    $scope.goTo = function(state) {
        $state.go("tabs.reports." + state);
    };

    var scrollObj = {
        overview    : "overview",
        report      : "report",
        premium     : "premium",
        netWorth    : "netWorth"
    };

    $scope.scrollClick = function(currentState) {
        //HIDE CHART ANNOTATION
        $("#divCursor").hide();

        $timeout(function(){
            var stateNameSplit = $state.current.name.split(".");
            var stateName = stateNameSplit[stateNameSplit.length - 1];

            if (currentState === stateName) {
                $timeout(function(){
                    $ionicScrollDelegate.$getByHandle(scrollObj[currentState]).scrollTop(true);
                },100);
            } else {
                $state.go("tabs.reports." + currentState);
                $timeout(function(){
                    $ionicScrollDelegate.$getByHandle(scrollObj[currentState]).scrollTop();
                },100);
            }
        },100);
    };
}]);

app.controller('ClientsTabsCtrl', ['$scope', '$state', '$timeout', '$ionicViewSwitcher', '$ionicScrollDelegate', '$ionicHistory', function($scope,$state,$timeout,$ionicViewSwitcher,$ionicScrollDelegate,$ionicHistory) {
    $scope.goTo = function(state) {
        $state.go("tabs.home.clients." + state);
    };
    $scope.goToHome = function() {
        $ionicViewSwitcher.nextDirection('back');
        //$ionicHistory.goBack();
        $state.go("tabs.home");
    };

    //var scrollObj = {
    //    overview    : "overview",
    //    report      : "report",
    //    premium     : "premium",
    //    netWorth    : "netWorth"
    //};
    //
    $scope.scrollClick = function(currentState) {
        //HIDE CHART ANNOTATION
        $("#divCursor").hide();

        $timeout(function(){
            var stateNameSplit = $state.current.name.split(".");
            var stateName = stateNameSplit[stateNameSplit.length - 1];

            if (currentState === stateName) {
                //$timeout(function(){
                //    $ionicScrollDelegate.$getByHandle(scrollObj[currentState]).scrollTop(true);
                //},100);
            } else {
                $state.go("tabs.home.clients." + currentState);
                //$timeout(function(){
                //    $ionicScrollDelegate.$getByHandle(scrollObj[currentState]).scrollTop();
                //},100);
            }
        },100);
    };
}]);

