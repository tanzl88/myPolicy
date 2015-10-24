app.service('localNotificationService', function ($rootScope, $q, $state, $ionicHistory, $cordovaLocalNotification, $translate) {
    var check_id_g = [];
    $rootScope.$on("LOGOUT", function(){
        check_id_g = [];
    });

    function calculate_offset(time, offset_days) {
        return new Date(time - offset_days * 24 * 3600 * 1000);
    }


    return {
        init: function () {
            $cordovaLocalNotification.getAll().then(function (notifications) {
                //console.log("GET ALL");
                //console.log(notifications);
                var checkIdArray = [];
                angular.forEach(notifications,function(notification,index){
                    if (notification.data !== undefined) {
                        var data = JSON.parse(notification.data);
                        if (data.checkId !== undefined && data.checkId.substr(4) !== "undefined") checkIdArray.push(data.checkId);
                    }
                });
                check_id_g = checkIdArray;
            });
        },
        add: function (reminderInputObj) {
            var title = $translate.instant(reminderInputObj.type.toUpperCase() + "_REMINDER");
            var notifiId = reminderInputObj.mode === "new" ? sdbmHash(reminderInputObj.notifiId) : reminderInputObj.notifiId;
            var thisService = this;

            //UNIT TEST
            //reminderInputObj.notifiTime = Date.now() + 5000;
            //reminderInputObj.frequency = "0";
            console.log(moment(reminderInputObj.notifiTime,"x").format("DD MMM YYYY, hh:mm"));

            var params = {
                id          : sdbmHash(reminderInputObj.notifiId),
                title       : title,
                text        : reminderInputObj.name,
                at          : reminderInputObj.notifiTime,
                every       : reminderInputObj.frequency,
                //sound: "file://sounds/reminder.mp3",
                data        : JSON.stringify(reminderInputObj.data)
            };
            if (ionic.Platform.isAndroid()) {
                params.icon = "img/icon.png",
                    params.smallIcon = "img/icon.png";
                params.led = "fed82f";
            }

            //console.log(params);

            $cordovaLocalNotification.schedule(params).then(function () {
                console.log('callback for adding background notification');
                thisService.init();
            });
        },
        addMultiple: function (reminderInputObjArray) {
            var paramsArray = [];
            var thisService = this;
            angular.forEach(reminderInputObjArray,function(reminderInputObj,index){
                var title = $translate.instant(reminderInputObj.type.toUpperCase() + "_REMINDER");
                var notifiId = reminderInputObj.mode === "new" ? sdbmHash(reminderInputObj.notifiId) : reminderInputObj.notifiId;
                var params = {
                    id          : sdbmHash(reminderInputObj.notifiId),
                    title       : title,
                    text        : reminderInputObj.name,
                    at          : reminderInputObj.notifiTime,
                    every       : reminderInputObj.frequency,
                    //sound: "file://sounds/reminder.mp3",
                    data        : JSON.stringify(reminderInputObj.data)
                };
                if (ionic.Platform.isAndroid()) {
                    params.icon = "img/icon.png",
                    params.smallIcon = "img/icon.png";
                    params.led = "fed82f";
                }
                paramsArray.push(params);
            });

            $cordovaLocalNotification.schedule(paramsArray).then(function () {
                console.log('callback for adding background notification');
                thisService.init();
            });
        },
        isScheduled : function(id) {
            var dfd = $q.defer();
            $cordovaLocalNotification.isScheduled(id).then(function (isScheduled) {
                dfd.resolve(isScheduled);
            });
            return dfd.promise;
        },
        cancel: function (id) {
            var hash = sdbmHash(id);
            var thisService = this;
            $cordovaLocalNotification.cancel(hash).then(function (status) {
                console.log('callback for cancellation background notification');
                thisService.init();
            });
        },
        cancelAll: function () {
            var dfd = $q.defer();
            $cordovaLocalNotification.cancelAll().then(function () {
                console.log('callback for canceling all background notifications');
                dfd.resolve("OK");
            });
            return dfd.promise;
        },
        getExistingCheckIds : function() {
            return check_id_g;
        }
    }
});