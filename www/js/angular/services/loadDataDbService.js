app.service('loadDataDbService', function($q,$http,$toast,credentialManager,
                                          policyDataDbService,personalDataDbService,advisorDataDbService,clientListDbService,notificationDbService,customSuggestedDbService,
                                          policyDataService,reminderService,userService,pushNotificationService,loadingService) {

    function initIonicService() {
        //IONIC USER INIT
        userService.init();
        //PUSH NOTIFICATION SERVICE INIT
        pushNotificationService.init();
    }

    return {
        processLoginData : function(data,callback) {
            if (data.credential === "client") {
                //ANALYTICS
                if (ionic.Platform.isWebView()) window.analytics.setUserId(sdbmHash(data.data.personal.userId));

                credentialManager.setCredential("client");
                credentialManager.setClientSelectedObj({
                    id       : data.data.personal.userId,
                    //name     : displayName,
                    type     : "link"
                });
                this.setClientData(data.data.policy,data.data.personal,data.data.advisor,data.data.notification,data.data.suggested);
                initIonicService();
                if (callback !== undefined) callback();
            } else if (data.credential === "advisor") {
                //ANALYTICS
                if (ionic.Platform.isWebView()) window.analytics.setUserId(sdbmHash(data.data.advisor.advisorId));

                credentialManager.setCredential("advisor");
                this.setAdvisorData(data.data.advisor,data.data.clients,data.data.temp,data.data.reminders);
                initIonicService();
                if (callback !== undefined) callback();
            } else {
                $toast.show("UNKNOWN_ERROR");
                loadingService.hide();
            }
        },
        setClientData : function(policyData,personalData,advisorData,notificationData,suggestedData) {
            policyDataDbService.set(policyData);
            personalDataDbService.set(personalData);
            notificationDbService.set(notificationData);
            customSuggestedDbService.set(suggestedData);
            if (credentialManager.getCredential() === "client") advisorDataDbService.set(advisorData);
        },
        loadPoliciesData : function() {
            var dfd = $q.defer();
            policyDataDbService.init().then(function(){
                dfd.resolve("OK");
            });
            return dfd.promise;
        },
        loadPersonalData : function() {
            var dfd = $q.defer();
            personalDataDbService.init().then(function(){
                dfd.resolve("OK");
            });
            return dfd.promise;
        },
        setAdvisorData : function(advisorData,clientList,tempAccountList,reminders) {
            advisorDataDbService.set(advisorData);
            clientListDbService.set(clientList, tempAccountList);
            if (ionic.Platform.isWebView()) reminderService.set(reminders);
        }
    }
});