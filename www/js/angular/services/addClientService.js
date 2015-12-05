app.service('addClientService', function($q,$http,$toast,$timeout,loadDataDbService,clientListDbService,credentialManager,loadingService,errorHandler) {

    var addClientSwiper = {};

    // ------------- ADD -------------
    function createTempAccount(input,dfd) {
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
                            dfd.resolve({
                                status : "tempOK",
                                data   : statusData.data
                            });
                        }
                    });
                } else if (statusData["status"] === "failed") {
                    $toast.show("CREATE_ACCOUNT_FAILED");
                    dfd.resolve({
                        status : "failed"
                    });
                } else {
                    errorHandler.handleOthers(statusData["status"]);
                    dfd.resolve({
                        status : "error"
                    });
                }
            });
    }
    function linkAccount(input,dfd) {
        $http.post(ctrl_url + "request_link_account", input)
            .success(function(statusData){
                if (statusData["status"] === "OK") {
                    $toast.show("REQUEST_SENT");
                    dfd.resolve({
                        status : "linkOK"
                    });
                } else if (statusData["status"] === "linked") {
                    $toast.show("ACCOUNT_LINKED_ERROR");
                    loadingService.hide();
                    dfd.resolve({
                        status : "failed"
                    });
                } else if (statusData["status"] === "client_not_found") {
                    $toast.show("EMAIL_NOT_FOUND_ERROR");
                    loadingService.hide();
                    dfd.resolve({
                        status : "failed"
                    });
                } else if (statusData["status"] === "pending") {
                    $toast.show("REQUEST_PENDING");
                    loadingService.hide();
                    dfd.resolve({
                        status : "failed"
                    });
                }  else {
                    errorHandler.handleOthers(statusData["status"]);
                    dfd.resolve({
                        status : "error"
                    });
                }
            });
    }

    return {
        initAddClientSwiper : function(which) {
            if (addClientSwiper[which] === undefined) {
                addClientSwiper[which] = new Swiper("#add_client_modal." + which +" .swiper-container", {
                    onlyExternal: true
                });
            }
            $timeout(function(){
                addClientSwiper[which].slideTo(0,0);
            },100);

        },
        addClient : function(form,which) {
            var dfd = $q.defer();

            var activeIndex = addClientSwiper[which].activeIndex;
            if (activeIndex === 0) {
                if (form.accountName.$invalid) {
                    form.accountName.$setDirty();
                } else {
                    loadingService.show("CREATING_ACCOUNT");
                    createTempAccount({
                        accountName : form.accountName.$modelValue
                    },dfd);
                }
            } else {
                if (form.clientEmail.$invalid) {
                    form.clientEmail.$setDirty();
                } else {
                    loadingService.show("LINKING_ACCOUNT");
                    linkAccount({
                        clientEmail : form.clientEmail.$modelValue,
                    },dfd);
                }
            }

            return dfd.promise;
        },
        slideNext : function(which) {
            addClientSwiper[which].slideNext();
        },
        slidePrev : function(which) {
            addClientSwiper[which].slidePrev();
        }
    }
});