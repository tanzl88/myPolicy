app.controller('LoginCtrl', ['$scope', '$rootScope', '$state', '$timeout', '$interval', '$http', '$toast', '$ionicUser', '$cordovaDevice', '$ionicViewSwitcher', '$ionicNavBarDelegate', '$cordovaInAppBrowser', 'pushNotificationService', 'utilityService', 'credentialManager', 'loadDataDbService', 'loadingService', 'errorHandler', function($scope,$rootScope,$state,$timeout,$interval,$http,$toast,$ionicUser,$cordovaDevice,
                                     $ionicViewSwitcher,$ionicNavBarDelegate,$cordovaInAppBrowser,pushNotificationService,utilityService,
                                     credentialManager,loadDataDbService,loadingService,errorHandler) {
    $scope.initVar = function() {
        if (ionic.Platform.isWebView()) {
            var autoLoginTimer = $interval(function(){
                //CHECK IF NETWORK STATUS IS ALREADY AVAILABLE
                if ($rootScope.isOffline !== undefined) {
                    //IF AUTOLOGIN IS ON AND IS ONLINE -> AUTO LOGIN
                    if (localStorage.getItem('autologin') === "true" && !$rootScope.isOffline) {
                        $scope.email = localStorage.getItem('autologinEmail');
                        autoLogin();
                    } else {
                        utilityService.resetForm("loginForm",{
                            email : undefined,
                            password : undefined
                        });
                    }
                    $interval.cancel(autoLoginTimer);
                }
            },300);
        }
    };
    $scope.rememberMe = true;


    // ------------- LOGIN -------------
    function setAutoLogin(loginForm,rememberMe) {
        if (rememberMe === true) {
            localStorage.setItem('autologin',true);
            localStorage.setItem('autologinEmail',loginForm.email.$modelValue);
            $("#loginPassword").val(undefined);
            $scope.password = undefined;
        } else {
            localStorage.removeItem('autologin');
            localStorage.removeItem('autologinEmail');
            $("#loginEmail").val(undefined);
            $("#loginPassword").val(undefined);
        }
    }
    function autoLogin() {
        loadingService.show("LOGGING_IN");

        var loginStartTime = Date.now();
        $http.post(register_url + 'autologin')
            .success(function(data){
                //ANALYTICS
                if (ionic.Platform.isWebView()) window.analytics.trackTiming('AJAX', Date.now() - loginStartTime, 'Login', 'Auto');

                if (data.status === "OK") {
                    loadDataDbService.processLoginData(data,goToHome);
                } else {
                    $toast.show("SESSION_EXPIRED");
                    loadingService.hide();
                }
            }).
            error(function(data, status, headers, config){
                errorHandler.handleHttpError(status,function(){
                    loadingService.hide();
                });
            });
    }

    $scope.login = function(loginForm) {
        //HIDE KEYBOARD UPON SUBMIT
        var delay_time = utilityService.getKeyboardDelay();
        $timeout(function(){
            if (loginForm.email.$error.required || loginForm.password.$error.required) {
                $toast.show("LOGIN_ERROR")
            } else {
                loadingService.show("LOGGING_IN");
                var input = {
                    email       : loginForm.email.$modelValue,
                    password    : loginForm.password.$modelValue,
                    rememberMe  : loginForm.rememberMe.$modelValue,
                };

                var loginStartTime = Date.now();

                $http.post(register_url + 'login', input).
                    success(function(data) {
                        //ANALYTICS
                        if (ionic.Platform.isWebView()) window.analytics.trackTiming('AJAX', Date.now() - loginStartTime, 'Login', 'Manual');

                        var status = data.status;
                        if (status === "OK") {
                            //SET AUTOLOGIN
                            setAutoLogin(loginForm,input.rememberMe);
                            loginForm.email.$setPristine();
                            loginForm.password.$setPristine();
                            loadDataDbService.processLoginData(data,goToHome);
                        } else if (status === "NOT ACTIVATED") {
                            $toast.show("NOT_ACTIVATED");
                            loadingService.hide();
                        } else if (status === "BANNED") {
                            $toast.show("BANNED");
                            loadingService.hide();
                        } else if (status === "LOGIN ERROR") {
                            $toast.show("LOGIN_FAILED");
                            loadingService.hide();
                        } else {
                            errorHandler.handleUnknown();
                        }

                    }).
                    error(function(data, status, headers, config){
                        errorHandler.handleHttpError(status,function(){
                            loadingService.hide();
                        });
                    });
            }
        },delay_time);
    };



    // ------------- CHECKBOX -------------
    $scope.toggleCheckbox = function() {
        $scope.rememberMe = !$scope.rememberMe;
    };


    // ------------- HANDLE OPEN URL -------------
    $scope.handleOpenURL = function(method,args) {
        $rootScope.args = args;
        if (method === "forgotpassword") {
            $state.go("resetPassword");
        }
        if (method === "activatesuccess") {
            $toast.show("ACCOUNT_ACTIVATED");
        }
    };

    // ------------- IN APP BROWSER -------------
    function openLinkInInAppBrowser(link) {
        loadingService.show("LOADING");
        var toolbar = (ionic.Platform.isIOS()) ? 'yes' : 'no';
        var options = {
            location: 'no',
            toolbar: toolbar,
            hardwareback: 'yes'
        };
        $cordovaInAppBrowser.open(link, '_blank', options);
        $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
            loadingService.hide();
        });
    }

    $scope.termsOfUse = function() {
        openLinkInInAppBrowser('https://mypolicyapp.com/Terms%20of%20Service.html');
    };
    $scope.privacyPolicy = function() {
        openLinkInInAppBrowser('https://mypolicyapp.com/Privacy%20Policy.html');
    };

    // ------------- NAVIGATION -------------
    function goToHome() {
        $timeout(function(){
            $ionicViewSwitcher.nextDirection('forward');
            $state.go("tabs.home");
            $timeout(function(){
                loadingService.hide();
            },100);
        },1);
    }
    $scope.goToState = function(state) {
        $ionicViewSwitcher.nextDirection('forward');
        $state.go(state);
    };

}]);