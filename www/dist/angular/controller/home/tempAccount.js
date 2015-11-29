app.controller('tempAccountCtrl', ['$scope', '$http', '$ionicHistory', '$translate', '$toast', '$timeout', 'loadingService', 'modalService', 'loadDataDbService', 'credentialManager', 'clientListDbService', 'errorHandler', function($scope,$http,$ionicHistory,$translate,$toast,$timeout,loadingService,modalService,
                                           loadDataDbService,credentialManager,clientListDbService,errorHandler) {
    function getTempAccount(callback) {
        $http.post(ctrl_url + "get_temp_account")
            .success(function(statusData){
                if (statusData.status === "OK") {
                    angular.forEach(statusData.data, function(data,index){
                        statusData.data[index].accountCreated = moment(data.accountCreated).format("LL");
                    });
                    $scope.tempAccounts = statusData.data;
                    hideEverything();
                    if (validity_test(callback)) callback();
                } else {
                    errorHandler.handleOthers(statusData.status);
                }
            });
    }
    function hideEverything() {
        loadingService.hide();

        $scope.tempAccountModal.hide();
        $scope.generateTokenModal.hide();
        $scope.removeModal.hide();
    }


    // ------------- INIT VAR -------------
    function setSelectedId(id) {
        $scope.selectedId = id;
    }
    $scope.initVar = function() {
        var clients = clientListDbService.getClients();
        $scope.tempAccounts = _.filter(clients, function(client){ return client.type === "temp"; });
        console.log($scope.tempAccounts);
        //getTempAccount();

        //FOR ACTIVE / SELECTED CLIENT HIGHLIGHT
        var selectedId =  (credentialManager.getClientSelected() === true) ? credentialManager.getClientProperty("temp") : undefined;
        setSelectedId(selectedId);
    };

    //ZL
    $scope.refreshProfileClientList = function() {
        clientListDbService.refresh().then(function(status){
            if (status === "OK") {
                $("#home_view").scope().refreshClientList();
            }
        });

    };

    // ------------- MENU ACTION -------------
    $scope.selectAccount = function(index) {
        var selectedAccount = $scope.tempAccounts[index];
        var input = {
            id : selectedAccount.id
        };

        loadingService.show("DOWNLOADING_ACCOUNT_DATA");
        $http.post(ctrl_url + "sign_in_temp_account", input)
            .success(function(statusData){
                if (statusData.status === "OK") {
                    //LOAD CLIENTS DATA IF SUCCESS
                    $http.post(ctrl_url + "get_client_data", {userId : statusData.data})
                        .success(function(data){
                            if (data.status === "OK") {
                                loadDataDbService.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
                                var clientObj = {
                                    temp : selectedAccount.id,
                                    id   : selectedAccount.userId,
                                    name : selectedAccount.accountName,
                                    type : "temp"
                                };
                                credentialManager.setClientSelectedObj(clientObj);
                                //HIGHTLIGHT ACTIVE ID (TEMP ID)
                                setSelectedId(selectedAccount.id);
                                loadingService.hide();
                            } else {
                                errorHandler.handleOthers(data.status);
                            }
                        });
                } else if (statusData.status === "not_found") {
                    $toast.show("TEMP_ACCOUNT_NOT_FOUND_ERROR");
                } else {
                    errorHandler.handleOthers(statusData.status);
                }
            });
    };
    $scope.generateToken = function(index) {
        var selectedAccount = $scope.tempAccounts[index];
        //closeMenu(index,250);
        var input = {
            id : selectedAccount.userId
        };
        $http.post(register_url + "generate_token", input)
            .success(function(statusData){
                if (statusData.status === "OK") {
                    $scope.token = statusData.data.token;
                    $scope.generateTokenModal.show();
                } else if (statusData.status === "error") {
                    getTempAccount();
                    $toast.show("TEMP_ACCOUNT_NO_MATCH_ERROR");
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
        var input = {
            id : $scope.removeId
        };
        $http.post(ctrl_url + "remove_temp_account", input)
            .success(function(status){
               if (status === "success") {
                   getTempAccount(function(){
                       //REFRESH CLIENT LIST IN PROFILE
                       $scope.refreshProfileClientList();
                   });

                   if (credentialManager.getClientProperty("temp") === $scope.removeId) {
                       loadDataDbService.setClientData([],[],[],[],[]);
                       credentialManager.removeClientSelectedObj();
                   }

               } else if (status === "not_found") {
                   getTempAccount();
                   $toast.show("TEMP_ACCOUNT_NO_MATCH_ERROR");
               } else {
                   errorHandler.handleOthers(status);
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
                        getTempAccount(function(){
                            for (var i = 0 ; i < $scope.tempAccounts.length ; i++) {
                                if ($scope.tempAccounts[i].id === statusData.data.id) {
                                    $scope.selectAccount(i);
                                    $scope.refreshProfileClientList();
                                    break;
                                }
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

}]);

