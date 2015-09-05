app.controller('GlobalCtrl', function($scope,$rootScope,$timeout,$state,tutorialManager) {
    //ORIENTATION LOCK CONTROL
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        var stateNameSplit = toState.name.split(".");
        var stateName = stateNameSplit[stateNameSplit.length - 1];
        if (stateName === "list") {
            screen.unlockOrientation();
        } else {
            if (validity_test(screen.lockOrientation)) screen.lockOrientation("portrait-primary");
        }
    });
    //
    //$scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    //    viewData.enableBack = true;
    //});

    var tutorialArray = [
        "list",
        "birthday",
        "createClientAccount",
        "generateReport",
        "caseNotes"
    ];

    var stateArray = [
        //"login",
        "retrieveAccount",
        "activation",
        "resetPassword",
        "home",
        "birthday",
        "notification",
        "settings",
        "profile",
        "editProfile",
        "caseNotes",
        "addCaseNotes",
        "list",
        "gallery",
        "overview",
        "editPolicy",
        "addPolicy",
        "editAdvisorProfile",
        "advisorInfo",
        "generateReport",
        "createClientAccount",
        "report",
        "export",
        "dataCollection"
    ];

    $rootScope.$on("$ionicView.beforeEnter", function(scopes, states) {
        if (states.stateName !== undefined) {
            var stateNameSplit = states.stateName.split(".");
            var stateName = stateNameSplit[stateNameSplit.length - 1];

            //LOGIN
            if (stateName === "login") {
                $timeout(function(){
                    scopes.targetScope.initVar();
                },1);
            }

            //TUTORIAL
            if (localStorage.getItem("swipe-left-tutorial") != "true" && tutorialArray.indexOf(stateName) >= 0) {
                $timeout(function(){
                    tutorialManager.show("swipe-left-tutorial");
                },1);
            }
            if (localStorage.getItem("rotate-landscape-tutorial") != "true" && stateName === "list") {
                $timeout(function(){
                    tutorialManager.show("rotate-landscape-tutorial");
                },1);
            }

            //INIT VAR
            if (validity_test(states.stateName) && (states.direction === "forward" || states.direction === "swap")) {
                //INITIATION TRIGGER
                if (stateArray.indexOf(stateName) >= 0) {
                    $timeout(function(){
                        scopes.targetScope.initVar();
                    },1);
                }
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

app.controller('AppStatusCtrl', function($scope,$http) {

    //VERSION STATUS
    if (ionic.Platform.isIOS()) {
        var platform = "iOS";
        var version = 1;
    } else if (ionic.Platform.isAndroid()) {
        var platform = "Android";
        var version = 1;
    } else {
        var platform = "Other";
        var version = 1;
    }
    $http.post(ctrl_url + "check_version", {platform : platform})
        .success(function(minVersion){
            if (version < parseInt(minVersion)) {
                $scope.needUpdate = true;
            }
        });
});
