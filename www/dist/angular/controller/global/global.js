app.controller('GlobalCtrl', ['$scope', '$rootScope', '$timeout', '$state', 'tutorialManager', 'credentialManager', 'loadingService', function($scope,$rootScope,$timeout,$state,tutorialManager,credentialManager,loadingService) {
    //ORIENTATION LOCK CONTROL
    //$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    //    //IF LIST TAB AND CLIENT SELECTED / CLIENT -> ALLOW ORIENTATION CHANGE
    //    //ELSE LOCK IN PORTRAIT MODE
    //    var stateNameSplit = toState.name.split(".");
    //    var stateName = stateNameSplit[stateNameSplit.length - 1];
    //    if (stateName === "list" && (credentialManager.getCredential() === "client" || credentialManager.getClientSelected())) {
    //        screen.unlockOrientation();
    //    } else {
    //        if (validity_test(screen.lockOrientation)) screen.lockOrientation("portrait-primary");
    //    }
    //});


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

            //LOADING SCREEN WHILE WAITING FOR VIEW TO RENDER
            //if (stateName === "list" && !states.fromCache) {
            //    loadingService.show("LOADING");
            //}


            //TUTORIAL
            if (localStorage.getItem("swipe-left-tutorial") != "true" && tutorialArray.indexOf(stateName) >= 0) {
                $timeout(function(){
                    tutorialManager.show("swipe-left-tutorial");
                },1);
            }
            //if (localStorage.getItem("rotate-landscape-tutorial") != "true" && stateName === "list") {
            //    $timeout(function(){
            //        tutorialManager.show("rotate-landscape-tutorial");
            //    },1);
            //}

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
}]);


app.controller('NetworkStatusCtrl', ['$scope', '$rootScope', function($scope,$rootScope) {
    $scope.$watch(function() {
            return $rootScope.isOffline },
            function(newValue, oldValue) {
                console.log("NETWORK STATUS CHANGED");
                $scope.isOffline = $rootScope.isOffline;
            }
    );
}]);

app.controller('AppStatusCtrl', ['$scope', '$http', function($scope,$http) {

    //VERSION STATUS
    if (ionic.Platform.isIOS()) {
        var platform = "iOS";
        var version = 4;
    } else if (ionic.Platform.isAndroid()) {
        var platform = "Android";
        var version = 4;
    } else {
        var platform = "Other";
        var version = 4;
    }
    $http.post(ctrl_url + "check_version", {platform : platform})
        .success(function(minVersion){
            if (version < parseInt(minVersion)) {
                $scope.needUpdate = true;
            }
        });
}]);
