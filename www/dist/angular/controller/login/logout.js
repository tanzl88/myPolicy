app.controller('LogoutCtrl', ['$scope', '$rootScope', '$ionicViewSwitcher', '$state', '$timeout', '$http', '$ionicHistory', 'loadingService', function($scope,$rootScope,$ionicViewSwitcher,$state,$timeout,$http,$ionicHistory,loadingService) {
    $scope.logout = function() {
        loadingService.show("LOGGING_OUT");
        localStorage.removeItem("autologin");
        $http.post(register_url + "logout")
            .success(function(){
                $ionicViewSwitcher.nextDirection('back');
                $state.go("login");
                $timeout(function(){
                    $rootScope.$broadcast("LOGOUT");
                    $ionicHistory.clearHistory();
                    //$ionicHistory.clearCache();
                    loadingService.hide();
                },333);
            });
    };
}]);