app.controller('ListCtrl', function($rootScope,$scope,$state,$filter,$http,$translate,$timeout,$toast,$ionicScrollDelegate,
                                    reactDOMService,policyDataDbService,credentialManager,modalService,loadingService,errorHandler) {
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
        $scope.initVar();
    };
    $scope.updatePolicy = function(policyObj) {
        for (var i = 0 ; i < $scope.policies.length ; i++) {
            if ($scope.policies[i].id === policyObj.id) {
                $scope.policies[i] = policyObj;
                break;
            }
        }
        $scope.initVar();
    };

    //$scope.renderFullTable = true;

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
        loadingService.show("REMOVING_POLICY");
        policyDataDbService.removePolicyById($scope.removeId).then(function(status){
            if (status === "OK") {

            } else if (status === "failed") {
                $toast.show("REMOVE_POLICY_NOT_FOUND");
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
        $scope.fullTableObj     = reactDOMService.getFullTable([full_table_g]);
    };

    // --------------- INTERACTION MENU ---------------
    var originatorEv;
    $scope.toggleMenu = function() {
        $timeout(function(){
            $("#policyMenuTrigger").click();
        },1);
    };
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    // ------------ NO CLIENT ------------
    $scope.goToSelectClient = function() {
        $state.go("tabs.home");
    };

    $scope.fullTableColumns = full_table_g;
    if ($("html").hasClass("tablet")) {
        angular.forEach($scope.fullTableColumns, function(column,index){
            $scope.fullTableColumns[index]["width"] = parseInt(column.width) * 1.7 + "px";
        });
    }

    // ------------ GO TO GALLERY ------------
    $scope.goToGallery = function(event,index) {
        event.stopPropagation();

        if (credentialManager.getSubscription().type === 0) {
            credentialManager.showUpgradeAccountModal();
        } else {
            $rootScope.policyId = $scope.policies[index].id;
            $rootScope.userId   = credentialManager.getClientProperty("id");
            $state.go("tabs.list.gallery");
        }
    };

    //// ------------ ROTATE PORTRAIT ------------
    $scope.switchTo = function(orientation) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', "Full table toggle", orientation);

        if (orientation === "landscape") {
            $("body").addClass("landscape");
            //$scope.renderFullTable = true;
        } else {
            $("body").removeClass("landscape");
        }
        //TABLE DISPLAY SWITCH
        screen.lockOrientation(orientation + "-primary");
        //screen.unlockOrientation();
    };
    $scope.fullTableDoubleTap = function() {
        var scrollDelegate = $ionicScrollDelegate.$getByHandle('fullTableScroll');
        var currentZoom = scrollDelegate.getScrollView().__zoomLevel;
        var zoomLevel = currentZoom > 0.9 ? 0.3 : 1;
        scrollDelegate.zoomTo(zoomLevel,true);
    };
    //LIST TAB ORIENTATION CHANGE EVENT LISTENER
    //window.addEventListener("orientationchange", function() {
    //    if ($state.current.name === "tabs.list") {
    //        var orientation = (typeof screen.orientation === "object") ? (screen.orientation.type.split("-"))[0] : (screen.orientation.split("-"))[0];
    //        if (orientation === "landscape") {
    //            $scope.switchTo("landscape");
    //            //if ($scope.clientSelected) switchTo("landscape");
    //        } else {
    //            //TO PREVENT AFTER PAUSE PORTRAIT MODE
    //            if (!ionic.Platform.isIOS() && ($(window).width() < $(window).height())) {
    //                $scope.switchTo("landscape");
    //            } else {
    //                $scope.switchTo("portrait");
    //            }
    //        }
    //    }
    //}, false);
});

