app.controller('tempAccountCtrl', function($scope,$http,$ionicHistory,$translate,$toast,$timeout,loadingService,modalService,
                                           loadDataDbService,credentialManager,clientListDbService,errorHandler) {
    function hideEverything() {
        loadingService.hide();

        $scope.tempAccountModal.hide();
        $scope.generateTokenModal.hide();
        $scope.removeModal.hide();
    }


    // ------------- INIT VAR -------------
    function getSelectedId() {
        $scope.selectedId = credentialManager.getClientProperty("id");
    }
    function refreshList() {
        $scope.tempAccounts = _.filter(clientListDbService.getClients(), function(client){ return client.type === "temp"; });
    }
    $scope.initVar = function() {
        refreshList();

        //FOR ACTIVE / SELECTED CLIENT HIGHLIGHT
        getSelectedId();
        $scope.showTips = validity_test(localStorage.getItem("tempAccount")) ? false : true;
    };

    $scope.refreshProfileClientList = function() {
        clientListDbService.refresh().then(function(status){
            if (status === "OK") $("#home_view").scope().refreshClientList();
        });
    };

    $scope.hideTips = function() {
        localStorage.setItem("tempAccount",true);
        $scope.showTips = false;
    };

    // ------------- MENU ACTION -------------
    $scope.selectAccount = function(index) {
        var selectedAccount = $scope.tempAccounts[index];
        clientListDbService.selectClient(selectedAccount).then(function(data){
            if (data.status === "OK") {
                loadDataDbService.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
                getSelectedId();
            }
        });
    };
    $scope.generateToken = function(index) {
        var selectedAccount = $scope.tempAccounts[index];
        //closeMenu(index,250);
        var input = {
            id : selectedAccount.id
        };
        $http.post(register_url + "generate_token", input)
            .success(function(statusData){
                if (statusData.status === "OK") {
                    $scope.token = statusData.data.token;
                    $scope.generateTokenModal.show();
                } else if (statusData.status === "error") {
                    clientListDbService.refresh().then(function(result){
                        if (result === "OK") {
                            //REFRESH CLIENT LIST
                            refreshList();
                            $scope.refreshProfileClientList();

                            hideEverything();
                            $toast.show("TEMP_ACCOUNT_NO_MATCH_ERROR");
                        }
                    });
                } else {
                    errorHandler.handleOthers(statusData.status);
                }
            });
    };
    $scope.remove = function(index) {
        var selectedAccount = $scope.tempAccounts[index];
        $scope.removeId = selectedAccount.id;
        $scope.removeModal.show();
    };
    $scope.confirmRemove = function() {
        loadingService.show("REMOVING_ACCOUNT");
        clientListDbService.removeClient($scope.removeId).then(function(result){
            if (result === "OK") {
                //REFRESH GLOBAL CLIENT LIST AND THEN CLIENT LIST
                clientListDbService.refresh().then(function(result){
                    if (result === "OK") {
                        refreshList();
                        $scope.refreshProfileClientList();
                        //UNSET CLIENT DATA IF LOGIN ACCOUNT IS REMOVED
                        loadDataDbService.setClientData([],[],[],[],[],[]);
                        credentialManager.removeClientSelectedObj();
                        hideEverything();
                    }
                });

            } else if (result === "not_found") {
                //REFRESH GLOBAL CLIENT LIST AND THEN CLIENT LIST
                clientListDbService.refresh().then(function(result){
                    if (result === "OK") {
                        //REFRESH CLIENT LIST
                        refreshList();
                        $scope.refreshProfileClientList();

                        hideEverything();
                        $toast.show("TEMP_ACCOUNT_NO_MATCH_ERROR");
                    }
                });
            }
        });
    };
    $scope.showTempAccountModal = function() {
        $scope.tempAccountModal.show();
        var modalScope = $("#accountNameInput").scope();
        if (validity_test(modalScope.account)) {
            modalScope.account.name = undefined;
            modalScope.accountNameForm.accountName.$setPristine();
        };
    };
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

                        //REFRESH GLOBAL CLIENT LIST AND THEN CLIENT LIST
                        clientListDbService.refresh().then(function(result){
                            if (result === "OK") {
                                refreshList();
                                $scope.refreshProfileClientList();
                                for (var i = 0 ; i < $scope.tempAccounts.length ; i++) {
                                    if ($scope.tempAccounts[i].id === statusData.data.id) {
                                        $scope.selectAccount(i);
                                        break;
                                    }
                                }
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

    // ------------- MODAL -------------
    modalService.init("create_temp_account","create_temp_account",$scope).then(function(modal){
        $scope.tempAccountModal = modal;
    });
    modalService.init("generate_token","generate_token",$scope).then(function(modal){
        $scope.generateTokenModal = modal;
    });
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("TEMP_ACCOUNT_REMOVE_MSG");

});

