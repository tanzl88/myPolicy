app.service('errorHandler', ['$rootScope', '$q', '$http', '$ionicHistory', '$ionicViewSwitcher', '$state', '$toast', 'loadingService', '$timeout', function($rootScope,$q,$http,$ionicHistory,$ionicViewSwitcher,$state,$toast,loadingService,$timeout) {
    return {
        handleExpired : function() {
            loadingService.show("SESSION_EXPIRED");
            localStorage.removeItem("autologin");
            $http.post(register_url + "logout")
                .success(function(){
                    $ionicViewSwitcher.nextDirection('back');
                    $state.go("login");
                    $toast.show("SESSION_EXPIRED");
                    $timeout(function(){
                        $rootScope.$broadcast("LOGOUT");
                        $ionicHistory.clearHistory();
                        //$ionicHistory.clearCache();
                        loadingService.hide();
                    },333);
                });
        },
        handleUnknown : function() {
            $toast.show("UNKNOWN_ERROR");
            loadingService.hide();
        },
        handleOthers : function(status,callback) {
            if (status === "expired") {
                this.handleExpired();
            } else {
                this.handleUnknown();
            }
            if (callback !== undefined) callback();
        },
        handleHttpError : function(status,callback) {
            if (status === 0) {
                console.log("TIMEOUT");
                $toast.show("TIMEOUT_ERROR");
            } else {
                $toast.show("UNKNOWN_ERROR");
            }
            if (callback !== undefined) callback();
        }
    }
}]);