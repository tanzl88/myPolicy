app.controller('NotificationCtrl', function($scope,$toast,$http,notificationDbService,advisorDataDbService,loadingService,errorHandler) {
    $scope.initVar = function() {
        $scope.notifications = notificationDbService.get();
    };
    $scope.respondToRequest = function(index,respond) {
        loadingService.show("PLEASE_WAIT");
        var notification = $scope.notifications[index];
        var status = respond === "accept" ? "OK" : "ignore" ;
        var input = {
            id     : notification.index,
            status : status
        };
        $http.post(ctrl_url + "update_link", input)
            .success(function(statusData){
                if(statusData.status === "OK") {
                    //REMOVE NOTIFICATION
                    notificationDbService.remove(index);
                    $scope.initVar();

                    //IF ACCEPT GET ADVISOR DATA
                    if (respond === "accept") {
                        $toast.show("ACCOUNT_LINK_SUCCESS",{ name : notification.requestor});
                        advisorDataDbService.init();
                    }
                    $("#home_view").scope().updateInboxCount();
                } else if (statusData.status === "not_found") {
                    //REMOVE NOTIFICATION
                    $toast.show("REQUEST_NOT_FOUND");
                    notificationDbService.remove(index);
                    $scope.initVar();
                } else {
                    errorHandler.handleOthers(statusData.status);
                }
                loadingService.hide();
            });
    };

});