app.controller('linkedAccountCtrl', function($scope,$http,$ionicHistory,$translate,$toast,$timeout,loadingService,modalService,utilityService,
                                             loadDataDbService,credentialManager,clientListDbService,errorHandler) {
    function hideEverything() {
        loadingService.hide();

        $scope.removeModal.hide();
        $scope.linkAccountModal.hide();
    }


    // ------------- INIT VAR -------------
    function getSelectedId() {
        $scope.selectedId = credentialManager.getClientProperty("id");
        console.log($scope.selectedId);
    }
    function refreshList() {
        $scope.linkedAccounts = _.filter(clientListDbService.getClients(), function(client){ return client.type === "link"; });
    }
    $scope.initVar = function() {
        refreshList();

        //FOR ACTIVE / SELECTED CLIENT HIGHLIGHT
        var selectedId =  (credentialManager.getClientSelected() === true) ? credentialManager.getClientProperty("link") : undefined;
        getSelectedId();
    };

    $scope.refreshProfileClientList = function() {
        clientListDbService.refresh().then(function(status){
            if (status === "OK") $("#home_view").scope().refreshClientList();
        });
    };

    // ------------- MENU ACTION -------------
    $scope.selectAccount = function(index) {
        var selectedAccount = $scope.linkedAccounts[index];
        clientListDbService.selectClient(selectedAccount).then(function(data){
            if (data.status === "OK") {
                loadDataDbService.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
                getSelectedId();
            }
        });
    };
    $scope.remove = function(index) {
        var selectedAccount = $scope.linkedAccounts[index];
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
    $scope.openLinkModal = function() {
        $scope.linkAccountModal.show();
        utilityService.resetForm("linkAccountForm",{
            accountName : undefined
        });
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
    };

    // ------------- MODAL -------------
    modalService.init("link_account","link_account",$scope).then(function(modal){
        $scope.linkAccountModal = modal;
    });
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("TEMP_ACCOUNT_REMOVE_MSG");

});

