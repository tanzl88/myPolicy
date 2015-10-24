app.service('notificationDbService', ['$rootScope', function($rootScope) {
    var notification_g;
    $rootScope.$on("LOGOUT", function(){
        notification_g = null;
    });

    return {
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