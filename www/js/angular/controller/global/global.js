app.controller('GlobalCtrl', function($scope,$rootScope,$timeout,$state,$ionicPlatform,$ionicHistory,tutorialManager) {
    var tutorialArray = [
        "list",
        "birthday",
        "createClientAccount",
        "generateReport",
        "caseNotes"
    ];

    var trackViewObj = {
        signup                  : "Signup",
        forgot                  : "Forgot password",
        retrieveAccount         : "Retrieve account",
        home                    : "View home page",
        editAdvisorProfile      : "View advisor profile",
        createClientAccount     : "View client accounts",
        reminder                : "View reminders",
        generateReport          : "View reports",
        export                  : "Export reports",
        askQuestion             : "Ask questions",
        changePassword          : "Change password",
        changeEmail             : "Change email",
        list                    : "View policies",
        addPolicy               : "Add policy",
        editPolicy              : "Edit policy",
        gallery                 : "View picture notes",
        overview                : "View overview reports",
        report                  : "View protections reports",
        profile                 : "View client profile",
        caseNotes               : "View case notes",
        addCaseNotes            : "Add case notes",
        editProfile             : "Client edit profile"
    };

    $rootScope.$on("$ionicView.beforeEnter", function(scopes, states) {
        if (states.stateName !== undefined) {
            var stateNameSplit = states.stateName.split(".");
            var stateName = stateNameSplit[stateNameSplit.length - 1];

            //TUTORIAL
            if (localStorage.getItem("swipe-left-tutorial") != "true" && tutorialArray.indexOf(stateName) >= 0) {
                $timeout(function(){
                    tutorialManager.show("swipe-left-tutorial");
                },1);
            }

            //INIT VAR
            if (stateName === "login") {
                $timeout(function(){
                    scopes.targetScope.initVar();
                },1000);
            } else if (validity_test(states.stateName) && (states.direction === "forward" || states.direction === "swap" || states.direction === "none")) {
                //INITIATION TRIGGER
                if (scopes.targetScope.initVar !== undefined) {
                    $timeout(function(){
                        scopes.targetScope.initVar();
                    },1);
                }
            }

            //ANALYTICS
            if (trackViewObj[stateName] !== undefined) {
                if (ionic.Platform.isWebView()) window.analytics.trackView(trackViewObj[stateName]);
            }
        }
    });


    $rootScope.$on("$ionicView.afterEnter", function(scopes, states) {
        if (validity_test(states.stateName)) {
            var stateNameSplit = states.stateName.split(".");
            var stateName = stateNameSplit[stateNameSplit.length - 1];
            if (!states.fromCache && states.direction === "forward") {

            }
        }
    });

    //PREVENT BACK BUTTON TO GO BACK TO LOGIN
    if (ionic.Platform.isAndroid()) {
        $ionicPlatform.registerBackButtonAction(function(event) {
            if ($ionicHistory.currentView().stateName === "tabs.home" && $ionicHistory.backView().stateName === "login") {

            } else {
                $ionicHistory.goBack();
            }
        }, 100);
    }
});


app.controller('NetworkStatusCtrl', function($scope,$rootScope) {
    $scope.$watch(function() {
            return $rootScope.isOffline },
            function(newValue, oldValue) {
                console.log("NETWORK STATUS CHANGED");
                $scope.isOffline = $rootScope.isOffline;
            }
    );
});

app.controller('AppStatusCtrl', function($scope,$rootScope,$http,$cordovaInAppBrowser) {

    //VERSION STATUS
    if (ionic.Platform.isIOS()) {
        var platform = "iOS";
        var version = 7;
    } else if (ionic.Platform.isAndroid()) {
        var platform = "Android";
        var version = 7;
    } else {
        var platform = "Other";
        var version = 7;
    }
    $http.post(ctrl_url + "check_version", {platform : platform})
        .success(function(minVersion){
            if (version < parseInt(minVersion)) {
                $scope.needUpdate = true;
            }
        });

    $scope.update = function() {
        var iosLink = "https://itunes.apple.com/sg/app/mypolicy-by-introverts-sales/id1036065370?mt=8";
        var androidLink = "market://details?id=com.ionicframework.mypolicy296876";
        var link = (ionic.Platform.isIOS()) ? iosLink : androidLink;
        var toolbar = (ionic.Platform.isIOS()) ? 'yes' : 'no';
        var options = {
            location: 'no',
            toolbar: toolbar,
            hardwareback: 'yes'
        };
        $cordovaInAppBrowser.open(link, '_blank', options);

        if (ionic.Platform.isAndroid()) {
            $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
                if (event.url === "market://details?id=com.ionicframework.mypolicy296876") {
                    $cordovaInAppBrowser.close();
                }
            });
        }
    }
});
