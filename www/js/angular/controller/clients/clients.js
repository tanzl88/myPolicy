app.controller('clientsAccountCtrl', function($scope,$http,$ionicHistory,$translate,$toast,$timeout,loadingService,modalService,utilityService,addClientService,
                                             loadDataDbService,credentialManager,clientListDbService,errorHandler,$cordovaClipboard) {

    function hideEverything() {
        loadingService.hide();

        $scope.removeModal.hide();
        $scope.addClientModal.hide();
        $scope.editClientModal.hide();
    };
    function getProfileClientList() {
        $("#home_view").scope().getClientList();
    };
    function getSelectedId() {
        $scope.selectedId = credentialManager.getClientProperty("id");
    };
    function getClientList() {
        $scope.clients = _.sortBy(clientListDbService.getClients(),function(client){
            return client.name.toUpperCase();
        });
    };
    function refreshAllClientList(callback) {
        clientListDbService.refresh().then(function(result){
            if (result === "OK") {
                //REFRESH CLIENT LIST
                getClientList();
                getProfileClientList();

                hideEverything();
                if (callback !== undefined) callback();
            }
        });
    }
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
        getClientList();
        getSelectedId();
    };

    // ------------- ADD -------------
    $scope.add = function() {
        if ($scope.clients.length >= 50 && credentialManager.getSubscription().type === 0) {
            credentialManager.showUpgradeAccountModal();
        } else {
            $scope.addClientModal.show();
            $timeout(function(){
                addClientService.initAddClientSwiper("client");

                $scope.accountObj = angular.copy({
                    accountName : '',
                    linkEmail   : ''
                });
                $("#accountNameInput").scope().addClientForm.$setPristine();
            },100);
        }

    };
    $scope.confirmAdd = function(form) {
        addClientService.addClient(form,"client").then(function(result){
            if (result.status === "tempOK") {
                getClientList();
                getProfileClientList();
                for (var i = 0 ; i < $scope.clients.length ; i++) {
                    if ($scope.clients[i].temp === result.data.id) {
                        $scope.selectAccount(i);
                        break;
                    }
                }
                hideEverything();
            } else if (result.status === "linkOK") {
                hideEverything();
            } else if (result.status === "failed") {
                hideEverything();
            } else {
                hideEverything();
            }

        });
    };

    // ------------- EDIT -------------
    $scope.edit = function(index) {
        var selectedAccount = $scope.clients[index];
        $scope.editAccountName = selectedAccount.name;
        $scope.editId = selectedAccount.id;
        $scope.editClientModal.show();
    };
    $scope.confirmEdit = function(form) {
        if (form.accountName.$invalid) {
            form.accountName.$setDirty();
        } else {
            loadingService.show("SUBMITING");
            var input = {
                userId      : $scope.editId,
                accountName : form.accountName.$modelValue,
            };
            $http.post(ctrl_url + "rename_temp_account",input)
                .success(function(status){
                    if (status === "OK") {
                        refreshAllClientList(function(){
                            $toast.show("NAME_UPDATED");
                        });
                    } else if (status === "not_found") {
                        refreshAllClientList(function(){
                            $toast.show("TEMP_ACCOUNT_NO_MATCH_ERROR");
                        });
                    } else {
                        errorHandler.handleOthers(status);
                    }
                    loadingService.hide();
                });
        }
    };

    // ------------- REMOVE -------------
    $scope.remove = function(index) {
        var selectedAccount = $scope.clients[index];
        $scope.removeId = selectedAccount.id;
        $scope.removeModal.show();
    };
    $scope.confirmRemove = function() {
        loadingService.show("REMOVING_ACCOUNT");
        clientListDbService.removeClient($scope.removeId).then(function(result){
            if (result === "OK") {
                refreshAllClientList(function(){
                    //UNSET CLIENT DATA IF LOGIN ACCOUNT IS REMOVED
                    loadDataDbService.setClientData([],[],[],[],[],[]);
                    credentialManager.removeClientSelectedObj();
                });
            } else if (result === "not_found") {
                //REFRESH GLOBAL CLIENT LIST AND THEN CLIENT LIST
                refreshAllClientList(function(){
                    $toast.show("TEMP_ACCOUNT_NO_MATCH_ERROR");
                });
            }
        });
    };
    // ------------- GENERATE LOGIN -------------
    $scope.generateLogin = function(event,index) {
        event.stopPropagation();

        var selectedAccount = $scope.clients[index];
        var input = {
            id : selectedAccount.id
        };
        $http.post(register_url + "generate_login_info", input)
            .success(function(statusData){
                if (statusData.status === "OK") {
                    $scope.loginName = statusData.data.loginName;
                    $scope.password = statusData.data.password;
                    $scope.generateTokenModal.show();
                } else if (statusData.status === "error") {
                    refreshAllClientList(function(){
                        $toast.show("TEMP_ACCOUNT_NO_MATCH_ERROR");
                    });
                } else {
                    errorHandler.handleOthers(statusData.status);
                }
            });
    };
    $scope.copy = function() {
        var loginInfo = "";
        loginInfo += $translate.instant("USERNAME") + " : " + $scope.loginName + "\n";
        loginInfo += $translate.instant("PASSWORD") + " : " + $scope.password;
        console.log(loginInfo);

        $cordovaClipboard
            .copy(loginInfo)
            .then(function () {
                $toast.show("COPY_MSG")
            }, function () {
                // error
            });
    };

    // ------------- MODAL -------------
    modalService.init("add_client","add_client",$scope).then(function(modal){
        $scope.addClientModal = modal;
        $scope.modalClass = "client";
    });
    $scope.slideNext = function() {
        addClientService.slideNext("client");
    };
    $scope.slidePrev = function() {
        addClientService.slidePrev("client");
    };

    modalService.init("edit_client","edit_client",$scope).then(function(modal){
        $scope.editClientModal = modal;
    });
    modalService.init("generate_token","generate_token",$scope).then(function(modal){
        $scope.generateTokenModal = modal;
    });
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("TEMP_ACCOUNT_REMOVE_MSG");

});

