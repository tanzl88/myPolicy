app.controller('HomeCtrl', function($scope,$http,$timeout,$state,$translate,$toast,loadingService,modalService,
                                    loadDataDbService,personalDataDbService,advisorDataDbService,policyDataService,clientListDbService,pushNotificationService,
                                    credentialManager,doughnutChartService,notificationDbService,utilityService,errorHandler) {

    //---------------------SWIPER---------------------
    $scope.profileMenuSwiper = new Swiper('#profile_menu', {
        speed: 333,
        onlyExternal: true,
    });

    // -------------------- NAVIGATION --------------------
    $scope.goTo = function(state) {
        $state.go("tabs.home." + state);
    };

    // -------------------- CLIENT LIST --------------------
    $scope.refreshClientName = function() {
        $scope.selectedClientName = credentialManager.getClientProperty("name");
    };
    $scope.selectClient = function(index) {
        loadingService.show("LOADING_CLIENT");
        var client = $scope.clientList[index];
        $http.post(ctrl_url + "get_client_data", {userId : client.id})
            .success(function(data){
                if (data.status === "OK") {
                    $scope.detriggerClientSearch();
                    credentialManager.setClientSelectedObj(client);
                    loadDataDbService.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
                    loadingService.hide();
                } else {
                    errorHandler.handleOthers(data.status);
                }
            });
    };
    $scope.toggleAddClient = function() {
        //$scope.addClientToggle = !$scope.addClientToggle;
        var swiper = $scope.profileMenuSwiper;
        var activeIndex = swiper.activeIndex;
        var nextIndex = (activeIndex + 1)%2;
        swiper.slideTo(nextIndex,333);
    };
    $scope.triggerClientSearch = function(event) {
        //$scope.addClientToggle = false;
        $scope.profileMenuSwiper.slideTo(0,0);
        var clientListEl = $(".client_list");
        var selectEl = $("#dashboard_section .client_select input");
        TweenLite.to(clientListEl, 400/1000, {
            height : "60%",
            ease : Power3.easeIn
        });
    };
    $scope.detriggerClientSearch = function() {
        var clientListEl = $(".client_list");
        var selectEl = $("#dashboard_section .client_select input");
        TweenLite.to(clientListEl, 400/1000, {
            height : "0%",
            ease : Power3.easeOut
        });
    };

    // -------------------- INIT VAR --------------------
    $scope.refreshClientList = function() {
        var clientList = clientListDbService.getClients();
        $scope.clientList = _.sortBy(clientList, function(client){ return client.name; });
    }
    $scope.initVar = function() {
        $scope.detriggerClientSearch();
        $scope.currency = $translate.instant("CURRENCY").trim();
        $scope.credential = credentialManager.getCredential();
        if ($scope.credential === "advisor") {
            $scope.advisorProfileFound = advisorDataDbService.profileFound();
            $scope.advisorData = advisorDataDbService.getData();
            $scope.refreshClientList();

            //SHOW TUTORIAL IF PROFILE NOT FOUND
            if ($scope.advisorProfileFound === false) {
                $timeout(function(){
                    var blockerHeight = $("#home_view ion-content").height() * 0.4 + $("#advisorProfileClick").outerHeight(true);
                    $("#tutorial_blocker_bottom").css("top",blockerHeight + 'px');
                    $(".tutorial_blocker").fadeIn(700);
                },100);
            } else {
                $timeout(function(){
                    $scope.dashboardAnimate();
                },600);
            }
        } else {
            $scope.updateInboxCount();
            $scope.meterAnimate();
        }
    };
    $scope.updateInboxCount = function() {
        $scope.inboxCount = notificationDbService.getCount();
    };






    // -------------------- MODAL AND ADD CLIENT --------------------
    function hideEverything() {
        loadingService.hide();
        $scope.tempAccountModal.hide();
        $scope.linkAccountModal.hide();
    }

    $scope.createTempAccount = function(form) {
        if (form.$invalid) {
            form.accountName.$setDirty();
        } else {
            loadingService.show("CREATING_ACCOUNT");
            var input = {
                accountName : form.accountName.$modelValue,
            };
            $http.post(register_url + "create_temp_account", input)
                .success(function(statusData){
                    if (statusData["status"] === "OK") {
                        //SET DATA TO EMPTY AND CHANGE CREDENTIAL SETTINGS
                        loadDataDbService.setClientData([],[],[],[],[]);
                        credentialManager.setClientSelectedObj({
                            temp : statusData.data.id,
                            id   : statusData.data.userId,
                            name : statusData.data.accountName,
                            type : "temp"
                        });

                        //REFRESH CLIENT LIST
                        clientListDbService.refresh().then(function(status){
                            if (status === "OK") {
                                $scope.refreshClientList();
                                hideEverything();
                            }
                        });
                    } else if (statusData["status"] === "failed") {
                        $toast.show("CREATE_ACCOUNT_FAILED");
                        hideEverything();
                    } else {
                        errorHandler.handleOthers(statusData["status"],hideEverything);
                    }
                });
        }
    };
    $scope.requestLinkAccount = function(form) {
        if (form.$invalid) {
            form.clientEmail.$setDirty();
        } else {
            loadingService.show("LINKING_ACCOUNT");
            var input = {
                clientEmail : form.clientEmail.$modelValue,
            };
            $http.post(ctrl_url + "request_link_account", input)
                .success(function(statusData){
                    if (statusData["status"] === "OK") {
                        console.log(statusData);
                        //pushNotificationService.push(statusData.data);
                        $toast.show("REQUEST_SENT");
                        hideEverything();
                    } else if (statusData["status"] === "linked") {
                        $toast.show("ACCOUNT_LINKED_ERROR");
                        loadingService.hide();
                    } else if (statusData["status"] === "client_not_found") {
                        $toast.show("EMAIL_NOT_FOUND_ERROR");
                        loadingService.hide();
                    } else if (statusData["status"] === "pending") {
                        $toast.show("REQUEST_PENDING");
                        loadingService.hide();
                    }  else {
                        errorHandler.handleOthers(statusData["status"],hideEverything);
                    }
                });
        }
    }

    modalService.init("create_temp_account","create_temp_account",$scope).then(function(modal){
        $scope.tempAccountModal = modal;
    });
    $scope.openTempModal = function() {
        $scope.tempAccountModal.show();
        utilityService.resetForm("accountNameForm",{
            accountName : undefined
        });
    };
    modalService.init("link_account","link_account",$scope).then(function(modal){
        $scope.linkAccountModal = modal;
    });
    $scope.openLinkModal = function() {
        $scope.linkAccountModal.show();
        utilityService.resetForm("linkAccountForm",{
            accountName : undefined
        });
    };
});

app.controller('NoClientCtrl', function($scope,$state,$timeout) {
    $scope.goToSelectClient = function() {
        $state.go("tabs.home");
        $timeout(function(){
            $("#home_view").scope().triggerClientSearch();
        },200);
    };
});

