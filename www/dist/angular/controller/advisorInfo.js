app.controller('AdvisorInfoCtrl', ['$scope', '$http', '$toast', '$ionicScrollDelegate', '$cordovaEmailComposer', '$translate', '$timeout', '$ionicHistory', 'utilityService', 'advisorDataDbService', 'loadingService', 'modalService', 'errorHandler', function($scope,$http,$toast,$ionicScrollDelegate,
                                           $cordovaEmailComposer,$translate,$timeout,$ionicHistory,utilityService,
                                           advisorDataDbService,loadingService,modalService,errorHandler) {
    $scope.initVar = function() {
        $scope.accountLinked = advisorDataDbService.profileFound();
        $scope.advisorInfo   = advisorDataDbService.getData();

        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('advisorInfo').scrollTop();

        //DEFAULT VALUE AND SET PRISTINE
        $("#advisor_info_view .email").val(undefined);
        $timeout(function(){
            $("#linkAccountForm").scope().linkAccountForm.$setPristine();
        },100);
    };
    $scope.feedbackContactPlaceholder = $translate.instant("FEEDBACK_CONTACT_PLCHDR");
    $scope.feedbackBodyPlaceholder = $translate.instant("FEEDBACK_BODY_PLCHDR");

    // --------------- CONTACT ADVISOR MENU (IF LINKED) ---------------
    var originatorEv;
    $scope.toggleMenu = function() {
        $timeout(function(){
            $("#contactAdvisorMenuTrigger").click();
        },1);
    };
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    // --------------- CONTACT ADVISOR (IF LINKED) ---------------
    $scope.call = function() {
        if (validity_test($scope.advisorInfo.phone)) {
            document.location.href = 'tel:'  + $scope.advisorInfo.phone;
        } else {
            $toast.show("NO_ADVISOR_PHONE")
        }
    };
    $scope.email = function() {
        if (validity_test($scope.advisorInfo.email)) {
            var email = {
                to     : $scope.advisorInfo.email,
                isHtml : true
            };
            $cordovaEmailComposer.open(email).then(null, function () {
                // user cancelled email
            });
        } else {
            $toast.show("NO_ADVISOR_EMAIL")
        }
    };

    // --------------- LINK ACCOUNT (IF NOT LINKED)  ---------------
    $scope.linkAccount = function(form) {
        if (form.$invalid) {
            form.advisorEmail.$setDirty();
        } else {
            loadingService.show("PLEASE_WAIT");
            var input = {
                advisorEmail : form.advisorEmail.$modelValue
            };
            $http.post(ctrl_url + "get_advisor_by_email", input)
                .success(function(statusData){
                    if (statusData.status === "OK") {
                        $scope.confirmDetails = true;
                        $scope.confirmDetailsObj = statusData.data;
                        loadingService.hide();
                    } else if (statusData.status === 'advisor_not_found') {
                        loadingService.hide();
                        $toast.show("ADVISOR_NOT_FOUND_LINK_ACCOUNT");
                    } else {
                        errorHandler.handleUnknown(statusData.status);
                    }
                });
        }

    };
    $scope.confirmLinkAccount = function() {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Link Account', 'Add');

        loadingService.show("PLEASE_WAIT");
        var input = {
            advisorEmail : $("#advisor_info_view .email").val()
        };
        $http.post(ctrl_url + "confirm_link_account", input)
            .success(function(statusData){
                if (statusData.status === "OK") {
                    advisorDataDbService.set(statusData.data);
                    loadingService.hide();
                    $scope.initVar();
                } else if (statusData.status === 'advisor_not_found') {
                    loadingService.hide();
                    $toast.show("ADVISOR_NOT_FOUND_LINK_ACCOUNT");
                } else if (statusData.status === 'account_linked') {
                    loadingService.hide();
                    $toast.show("ACCOUNT_LINKED_ERROR");
                } else {
                    errorHandler.handleUnknown(statusData.status);
                }
            });
    };

    // --------------- UNLINK ACCOUNT (IF LINKED) ---------------
    $scope.unlinkAccount = function() {
        $scope.unlinkAccountModal.show();
    };
    $scope.confirmUnlinkAccount = function() {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User interaction', 'Link Account', 'Remove');

        loadingService.show("PLEASE_WAIT");
        $http.post(ctrl_url + "unlink_account",{})
            .success(function(status){
                if (status === "OK") {
                    advisorDataDbService.set([]);
                    loadingService.hide();
                    $scope.unlinkAccountModal.hide();
                    $scope.initVar();
                } else {
                    errorHandler.handleOthers(status);
                }
            })
    };

    // ------------- MODAL -------------
    modalService.init("unlink_account","unlink_account",$scope).then(function(modal){
        $scope.unlinkAccountModal = modal;
    });
}]);
