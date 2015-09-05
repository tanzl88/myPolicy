app.service('loadDataDbService', function($q,$http,$state,$ionicViewSwitcher,$ionicHistory,$toast,credentialManager,
                                          policyDataDbService,personalDataDbService,advisorDataDbService,clientListDbService,notificationDbService,customSuggestedDbService,
                                          policyDataService,barChartService,reminderService) {
    return {
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
            console.log(tempAccountList);
            advisorDataDbService.set(advisorData);
            clientListDbService.set(clientList, tempAccountList);
            reminderService.set(reminders);
        }
    }
});