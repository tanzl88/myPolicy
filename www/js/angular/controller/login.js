app.controller('LoginCtrl', function($scope,$rootScope,$state,$timeout,$interval,$http,$toast,$ionicUser,$ionicPush,$cordovaDevice,
                                     $cordovaKeyboard,$ionicViewSwitcher,$ionicNavBarDelegate,$cordovaInAppBrowser,pushNotificationService,
                                     credentialManager,loadDataDbService,loadingService,errorHandler) {
    $scope.initVar = function() {
        if (isMobile()) {
            var autoLoginTimer = $interval(function(){
                if ($rootScope.isOffline !== undefined) {
                    if (localStorage.getItem('autologin') === "true" && !$rootScope.isOffline) {
                        $scope.email = localStorage.getItem('autologinEmail');
                        autoLogin();
                    }
                    $interval.cancel(autoLoginTimer);
                }
            },300);
        }
    };

    var toolbar = (ionic.Platform.isIOS()) ? 'yes' : 'no';
    var options = {
        location: 'no',
        toolbar: toolbar,
        hardwareback: 'yes'
    };
    $scope.rememberMe = true;

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
    $scope.termsOfUse = function() {
        $cordovaInAppBrowser.open('https://mypolicyapp.com/Terms%20of%20Service.html', '_blank', options);
    };
    $scope.privacyPolicy = function() {
        $cordovaInAppBrowser.open('https://mypolicyapp.com/Privacy%20Policy.html', '_blank', options);
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

    function processLoginData(data) {
        //IONIC USER
        var user = $ionicUser.get();
        if(!user.user_id) {
            user.user_id    = $ionicUser.generateGUID();
            user.credential = data.credential;
        };
        //console.log(user);
        $ionicUser.identify(user).then(function(){
            console.log("IDENTIFIED");
            //if (ionic.Platform.isWebView()) {
            //    console.log("ISWEBVIEW");
            //    var device = $cordovaDevice.getDevice();
            //    var input = {
            //        ionicId         : user.user_id,
            //        manufacturer    : device.manufacturer,
            //        model           : device.model,
            //        platform        : device.platform,
            //        uuid            : device.uuid,
            //        version         : device.version
            //    };
            //    $http.post(register_url + "set_user_analytics",input);
            //}
        });

        //IONIC PUSH
        if (ionic.Platform.isWebView()) {
            //$ionicPush.register({
            //    canShowAlert: true, //Can pushes show an alert on your screen?
            //    canSetBadge: true, //Can pushes update app icon badges?
            //    canPlaySound: true, //Can notifications play a sound?
            //    canRunActionsOnWake: true, //Can run actions outside the app,
            //    onNotification: function(notification) {
            //        // Handle new push notifications here
            //        console.log(notification);
            //        return true;
            //    }
            //});
        }

        //$rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
        //    console.log('Got token', data.token, data.platform);
        //    // Do something with the token
        //});

        //PUSH NOTIFICATION SERVICE INIT
        pushNotificationService.init();


        if (data.credential === "client") {
            credentialManager.setCredential("client");
            loadDataDbService.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
            goToHome();
        } else if (data.credential === "advisor") {
            credentialManager.setCredential("advisor");
            loadDataDbService.setAdvisorData(data.data.advisor,data.data.clients,data.data.temp,data.data.reminders);
            goToHome();
        } else {
            $toast.show("UNKNOWN_ERROR");
            loadingService.hide();
        }
    }


    // ------------- LOGIN -------------
    function autoLogin() {
        loadingService.show("LOGGING_IN");
        $http.post(register_url + 'autologin')
            .success(function(data){
                if (data.status === "OK") {
                    processLoginData(data);
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
        var delay_time = 0;
        if (isMobile() && $cordovaKeyboard.isVisible()) {
            $cordovaKeyboard.close();
            delay_time = 400;
        }

        //processLoginData({
        //    credential : "advisor",
        //    data : {
        //        advisor: [],
        //        client : [],
        //        temp : []
        //    },
        //});

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
                $http.post(register_url + 'login', input).
                    success(function(data) {
                        var status = data.status;
                        if (status === "OK") {
                            //SET AUTOLOGIN
                            if (input.rememberMe === true) {
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
                            loginForm.email.$setPristine();
                            loginForm.password.$setPristine();
                            processLoginData(data);
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



        //var input = {
        //    email       : loginForm.email.$modelValue,
        //    password    : loginForm.password.$modelValue,
        //    rememberMe  : $scope.rememberMe
        //};
        //
        //loadingService.show("LOADING");
        //loadDataDbService.loadClientData().then(function(status) {
        //    if (status === "OK") {
        //        loadingService.hide();
        //        $timeout(function(){
        //            $ionicViewSwitcher.nextDirection('forward');
        //            $state.go("tabs.profile");
        //        },1);
        //    }
        //});
    };

    // ------------- CHECKBOX -------------
    $scope.toggleCheckbox = function() {
        $scope.rememberMe = !$scope.rememberMe;
    };

});