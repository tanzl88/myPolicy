app.controller('HomeCtrl', function($rootScope,$scope,$http,$timeout,$interval,$state,$ionicViewSwitcher,$ionicHistory,$translate,$filter,$toast,$ionicModal,loadingService,modalService,
                                    loadDataDbService,personalDataDbService,advisorDataDbService,policyDataService,clientListDbService,pushNotificationService,
                                    credentialManager,doughnutChartService,notificationDbService,errorHandler) {

    //---------------------SWIPER---------------------
    $scope.profileMenuSwiper = new Swiper('#profile_menu', {
        speed: 333,
        onlyExternal: true,
    });

    // -------------------- NAVIGATION --------------------
    $scope.goTo = function(state) {
        $state.go("tabs.home." + state);
    };

    $scope.editAdvisorProfile = function() {
        $state.go("tabs.home.editAdvisorProfile");
    };



    // -------------------- CLIENT LIST --------------------
    //var clientList = name_list_g;
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

    // -------------------- DASHBOARD --------------------
    $scope.dashboardAnimate = function() {
        var greetEl = $("#dashboard_section .greet");
        var selectEl = $("#dashboard_section .client_select");
        var fadeInTime = 666;
        $(greetEl).fadeIn(fadeInTime);

        TweenLite.to(greetEl, fadeInTime/1000, {
            x: 0,
            ease : Power1.easeIn
        });

        $timeout(function(){
            $(selectEl).fadeIn(fadeInTime);
            TweenLite.to(selectEl, fadeInTime/1000, {
                x: 0,
                ease : Power1.easeIn
            });
        },fadeInTime);
    }

    // -------------------- INIT VAR --------------------
    $scope.refreshClientList = function() {
        var clientList = clientListDbService.getClients();
        $scope.clientList = _.sortBy(clientList, function(client){ return client.name; });
    }
    $scope.initVar = function() {
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
            $scope.meterData = policyDataService.getMeterData();
            drawDoughnuts();

            $scope.percentAnimate = 0;
            var percentAnimateTimer = $interval(function(){
                if ($scope.percentAnimate < $scope.meterData.percent) {
                    $scope.percentAnimate += 1;
                } else {
                    $interval.cancel(percentAnimateTimer);
                    animateInflate($("#percent_container"),1.2);
                    animateInflate($("#client-doughnut"),1.1);
                }
            },5);
        }
    };
    $scope.updateInboxCount = function() {
        $scope.inboxCount = notificationDbService.getCount();
    };

    // -------------------- LOGOUT --------------------
    $scope.logout = function() {
        loadingService.show("LOGGING_OUT");
        localStorage.removeItem("autologin");
        $http.post(register_url + "logout")
            .success(function(){
                $ionicViewSwitcher.nextDirection('back');
                $state.go("login");
                $timeout(function(){
                    $rootScope.$broadcast("LOGOUT");
                    $ionicHistory.clearHistory();
                    //$ionicHistory.clearCache();
                    loadingService.hide();
                },333);
            });
    };


    // -------------------- TOOLTIP MODAL --------------------
    $scope.showDoughnutTooltip = function() {
        $scope.highlightType = undefined
        var varReplace = {
            percent     : $scope.meterData.percent,
            current     : $filter('currency')($scope.meterData.cover,$scope.currency,0),
            suggested   : $filter('currency')($scope.meterData.suggest,$scope.currency,0)
        };
        $scope.dashboardDoughnutTooltip = $translate.instant("YOUR_PROTECTION_TOOLTIP",varReplace);
        $scope.doughnutTooltip.show();
    };
    modalService.init("doughnutTooltip","dashboardDoughnutTooltip",$scope).then(function(modal){
        $scope.doughnutTooltip = modal;
    });
    $scope.showCoverageStatusTooltip = function(type) {
        $scope.highlightType = type;
        $scope.coverageStatus = $translate.instant(type.toUpperCase() + "_TOOLTIP");
        $scope.coverageStatusNeeds = $scope.meterData[type + "P"];
        $scope.coverageStatusTooltip.show();
    };
    modalService.init("coverageStatusTooltip","coverageStatusTooltip",$scope).then(function(modal){
        $scope.coverageStatusTooltip = modal;
    });
    $scope.goToReport = function(type) {
        $scope.doughnutTooltip.hide();
        $scope.coverageStatusTooltip.hide();
        $timeout(function(){
            $state.go("tabs.report");
            $timeout(function(){
                angular.forEach($scope.meterData[type + "P"],function(cat,index){
                    var DOM = $("#" + cat.toUpperCase() + "_ROW td");
                    $(DOM).css("background-color","#FED82F");
                    $timeout(function(){
                        TweenLite.to(DOM, 0.2, {
                            css: { "backgroundColor" : "#FFFFFF" },
                            //ease: Power1.easeInOut
                        });
                    },2500);
                });
            },333);
        },333);
    };

    // -------------------- MODAL AND ADD CLIENT --------------------
    function hideEverything() {
        loadingService.hide();
        $scope.tempAccountModal.hide();
        $scope.closeLinkModal();
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

    $ionicModal.fromTemplateUrl('link_account.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.linkModal = modal;
    });
    $scope.openLinkModal = function() {
        $timeout(function(){
            $("#linkAccountInput").val("").focus();
        },400);
        $scope.linkModal.show();
    };
    $scope.closeLinkModal = function() {
        $scope.linkModal.hide();
    };
    $scope.$on('$destroy', function() {
        $scope.linkModal.remove();
    });

    //---------------------- DOUGHNUT CHART ----------------------------------
    function animateInflate(DOM,scale) {
        TweenLite.to(DOM, 0.3, {
            scale: scale,
            ease: Power1.easeInOut,
            onComplete: function() {
                TweenLite.to(DOM, 0.2, {
                    scale: 1,
                    ease: Power1.easeInOut
                });
            }
        });
    }
    function drawDoughnuts() {
        var initTimer;
        initTimer = $interval(function(){
            var ele_to_check = $("#dashboard_section .doughnut_container canvas");
            if (ele_to_check.length > 0) {
                //STYLING
                var view_height = $("#home_view ion-content").height();
                var coverage_number_height = $("#dashboard_coverage_number").height();
                var chart_width = (view_height * 0.6 - coverage_number_height) * 0.9;

                console.log(view_height + " vs " + chart_width);

                //var chart_width = Math.floor(window_width_g * 0.7);
                $("#dashboard_section .doughnut_container").width(chart_width).height(chart_width);
                $(ele_to_check).attr("width",chart_width).attr("height",chart_width);
                doughnutChartService.drawChart("client-doughnut", $scope.meterData.chartData, doughnutChartService.getChartOptions({
                    percentageInnerCutout: 60,
                    spaceTop: 1,
                    spaceBottom: 1,
                    spaceLeft: 1,
                    spaceRight: 1,
                    animationSteps: 50,
                }));
                $interval.cancel(initTimer);
            }
        },100);
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

