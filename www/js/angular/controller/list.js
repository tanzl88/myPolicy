app.controller('ListCtrl', function($rootScope,$scope,$state,$http,$translate,$timeout,$toast,
                                    policyDataDbService,credentialManager,modalService,loadingService,errorHandler) {
    // ------------ NAVIGATION ------------
    $scope.addPolicy = function() {
        $state.go("tabs.list.addPolicy");
    };
    $scope.editPolicy = function(index) {
        $rootScope.policyObj = $scope.policies[index];
        $rootScope.mode      = "edit";
        $state.go("tabs.list.addPolicy");
    };
    $scope.insertPolicy = function(policyObj) {
        $scope.policies.push(policyObj);
    };
    $scope.updatePolicy = function(policyObj) {
        for (var i = 0 ; i < $scope.policies.length ; i++) {
            if ($scope.policies[i].id === policyObj.id) {
                $scope.policies[i] = policyObj;
                break;
            }
        }
    };

    // ------------ REMOVE ------------
    function hideEverything() {
        loadingService.hide();
        $scope.removeModal.hide();
    }
    $scope.remove = function(index,id) {
        $scope.removeIndex = index;
        $scope.removeId = id;
        $scope.removeModal.show();
    };
    $scope.confirmRemove = function() {
        loadingService.show("REMOVING_REMINDER");
        policyDataDbService.removePolicyById($scope.removeId).then(function(status){
            if (status === "OK") {

            } else if (status === "failed") {
                $toast.show("REMOVE_REMINDER_NOT_FOUND");
            } else {
                errorHandler.handleOthers(status);
            }
            hideEverything();
        });
    };
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("POLICY_REMOVE_MSG");

    //$scope.refreshList = function() {
    //    policyDataDbService.init().then(function(){
    //        $scope.policies = policyDataDbService.getPolicies();
    //        $scope.$broadcast('scroll.refreshComplete');
    //    });
    //};

    // ------------ INIT VAR ------------
    $scope.initVar = function() {
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();
        $scope.policies         = policyDataDbService.getPolicies();
        $scope.sums             = policyDataDbService.getAllSum();
        loadingService.hide();
        //if ($scope.credential === "advisor" && !$scope.clientSelected) $toast.showClientNotSelected();
    };

    // ------------ NO CLIENT ------------
    $scope.goToSelectClient = function() {
        $state.go("tabs.home");
    };

    $scope.fullTableColumns = full_table_g;

    // ------------ GO TO GALLERY ------------
    $scope.goToGallery = function(index) {
        $rootScope.policyId = $scope.policies[index].id;
        $rootScope.userId   = credentialManager.getClientProperty("id");
        $state.go("tabs.list.gallery");
    };

    //// ------------ ROTATE PORTRAIT ------------
    //$scope.toPortrait = function() {
    //    $rootScope.lockOrientation = true;
    //    $("body").removeClass("landscape");
    //    screen.lockOrientation("portrait-primary");
    //};
    $scope.touch = function() {
        $scope.showRotate = false;
    };
    $scope.release = function() {
        $scope.showRotate = true;
    };



    //LIST TAB ORIENTATION CHANGE EVENT LISTENER
    window.addEventListener("orientationchange", function() {
        if ($state.current.name === "tabs.list") {
            var orientation = (typeof screen.orientation === "object") ? (screen.orientation.type.split("-"))[0] : (screen.orientation.split("-"))[0];
            console.info("ORIENTATION: " + orientation);
            if (orientation === "landscape") {
                $timeout(function(){
                    $scope.showFullTable = true;
                });
                $("body").addClass("landscape");
                screen.lockOrientation("landscape-primary");
                screen.unlockOrientation();
            } else {
                //TO PREVENT AFTER PAUSE PORTRAIT MODE
                if (!ionic.Platform.isIOS() && ($(window).width() < $(window).height())) {
                    $timeout(function(){
                        $scope.showFullTable = true;
                    });

                    $("body").addClass("landscape");
                    screen.lockOrientation("landscape-primary");
                    screen.unlockOrientation();
                } else {
                    $timeout(function(){
                        $scope.showFullTable = false;
                    });
                    $("body").removeClass("landscape");
                    screen.lockOrientation("portrait-primary");
                    screen.unlockOrientation();
                }
            }
        }
    }, false);
});

