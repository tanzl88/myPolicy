app.service('notificationDbService', ['$rootScope', '$http', 'errorHandler', function($rootScope,$http,errorHandler) {
    var notification_g;
    $rootScope.$on("LOGOUT", function(){
        notification_g = null;
    });



    return {
        refresh : function() {
            var thisService = this;
            console.log("REFRESHING NOTIFICATIONS");
            $http.get(ctrl_url + "get_notification" + "?decache=" + Date.now())
                .success(function(statusData){
                    if (statusData.status === "OK") {
                        thisService.set(statusData.data);
                        $rootScope.$broadcast("INBOX_REFRESH");
                    } else {
                        errorHandler.handleOthers(statusData.status);
                    }
                });
        },
        get : function() {
            return notification_g;
        },
        getCount : function() {
            return notification_g.length;
        },
        set : function(array) {
            notification_g = this.processNotifications(array);
        },
        processNotifications : function(notifications) {
            angular.forEach(notifications, function(notification,index){
                if (notification.type === "link") {
                    notifications[index].requestor = validity_test(notification.name) ? notification.name : notification.email;
                }
            });
            return notifications;
        },
        remove : function(index) {
            notification_g.splice(index,1);
        }
    }
}]);