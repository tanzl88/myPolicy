app.controller('HomeCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$state', '$translate', '$toast', 'nzTour', 'loadingService', 'modalService', '$ionicViewSwitcher', 'loadDataDbService', 'personalDataDbService', 'advisorDataDbService', 'policyDataService', 'clientListDbService', 'pushNotificationService', 'addClientService', 'credentialManager', 'doughnutChartService', 'notificationDbService', function($scope,$rootScope,$http,$timeout,$state,$translate,$toast,nzTour,loadingService,modalService,$ionicViewSwitcher,
                                    loadDataDbService,personalDataDbService,advisorDataDbService,policyDataService,clientListDbService,pushNotificationService,addClientService,
                                    credentialManager,doughnutChartService,notificationDbService) {

    // -------------------- NAVIGATION --------------------
    $scope.goTo = function(state) {
        $state.go("tabs.home." + state);
    };
    $scope.editAdvisorProfile = function() {
        console.log($scope.tour);
        if ($scope.tour !== undefined) {
            nzTour.stop($scope.tour).then(function(success){
                if (success) delete $scope.tour;
            });
        }
        $state.go("tabs.home.editAdvisorProfile");
    };


    // -------------------- CLIENT LIST --------------------
    $scope.refreshClientName = function() {
        $scope.selectedClientName = credentialManager.getClientProperty("name");
    };
    $scope.selectClient = function(index) {
        var client = $scope.clients[index];
        clientListDbService.selectClient(client).then(function(data){
            if (data.status === "OK") {
                loadDataDbService.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
                $scope.detriggerClientSearch();
            }
        });
    };
    $scope.triggerClientSearch = function(event) {
        //$scope.addClientToggle = false;
        //$scope.profileMenuSwiper.slideTo(0,0);
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
    $rootScope.$on("LOGOUT", function(){
        $scope.credential = undefined;
    });
    $scope.selectAccount = function(index) {
        var selectedAccount = $scope.clients[index];
        clientListDbService.selectClient(selectedAccount).then(function(data){
            if (data.status === "OK") {
                loadDataDbService.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
                getSelectedId();
            }
        });
    };
    $scope.initVar = function() {
        $scope.detriggerClientSearch();
        $scope.currency = $translate.instant("CURRENCY").trim();
        $scope.credential = credentialManager.getCredential();
        $scope.notWebView = !ionic.Platform.isWebView();
        if ($scope.credential === "advisor") {
            $scope.advisorProfileFound = advisorDataDbService.profileFound();
            $scope.advisorData = advisorDataDbService.getData();
            getClientList();

            //SHOW TUTORIAL IF PROFILE NOT FOUND
            if ($scope.advisorProfileFound === false) {
                $timeout(function(){
                    $scope.tour = {
                        config: {}, // see config
                        steps: [{
                            target: '#advisorProfileClick',
                            content: $translate.instant("WELCOME_TUTORIAL"),
                        }]
                    };

                    nzTour.start($scope.tour);
                },333);
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

    // -------------------- INBOX --------------------
    $rootScope.$on("INBOX_REFRESH", function(){
        console.log("INBOX REFRESH TRIGGERED");
        $scope.updateInboxCount();
    });
    $scope.updateInboxCount = function() {
        $scope.inboxCount = notificationDbService.getCount();
    };

    // -------------------- MODAL AND ADD CLIENT --------------------
    function getClientList() {
        $scope.clients = _.sortBy(clientListDbService.getClients(),function(client){
            return client.name.toUpperCase();
        });
    }
    $scope.getClientList = function() {
        getClientList();
    };

    function hideEverything() {
        loadingService.hide();
        $scope.addClientModal.hide();
        //$scope.tempAccountModal.hide();
        //$scope.linkAccountModal.hide();
    }
    $scope.add = function() {
        $scope.addClientModal.show();
        $timeout(function(){
            addClientService.initAddClientSwiper("home");

            $scope.accountObj = angular.copy({
                accountName : '',
                linkEmail   : ''
            });
            $("#accountNameInput").scope().addClientForm.$setPristine();
        },100);
    };
    $scope.confirmAdd = function(form) {
        addClientService.addClient(form,"home").then(function(result){
            console.log(result);
            if (result.status === "tempOK") {
                getClientList();
                for (var i = 0 ; i < $scope.clients.length ; i++) {
                    if ($scope.clients[i].id === result.data.id) {
                        $scope.selectAccount(i);
                        break;
                    }
                }
                hideEverything();
                $scope.detriggerClientSearch();
            } else if (result.status === "linkOK") {
                hideEverything();
            } else if (result.status === "failed") {
                hideEverything();
            } else {
                hideEverything();
            }

        });
    };

    modalService.init("add_client_home","add_client",$scope).then(function(modal){
        $scope.addClientModal = modal;
        $scope.modalClass = "home";
    });
    $scope.slideNext = function() {
        addClientService.slideNext("home");
    };
    $scope.slidePrev = function() {
        addClientService.slidePrev("home");
    };
}]);

app.controller('NoClientCtrl', ['$scope', '$state', '$timeout', function($scope,$state,$timeout) {
    $scope.goToSelectClient = function() {
        $state.go("tabs.home");
        $timeout(function(){
            $("#home_view").scope().triggerClientSearch();
        },200);
    };
}]);

