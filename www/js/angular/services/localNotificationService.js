app.service('localNotificationService', function ($rootScope, $q, $state, $ionicHistory, $cordovaLocalNotification, $translate) {
    var check_id_g = [];
    $rootScope.$on("LOGOUT", function(){
        check_id_g = [];
    });

    function calculate_offset(time, offset_days) {
        return new Date(time - offset_days * 24 * 3600 * 1000);
    }

    function getNotifiProperty(type) {
        switch (type) {
            case "review":
                var message = {
                    title : "REVIEW_REMINDER",
                    frequency : "0"
                };
                break;
            case "birthday":
                var message = {
                    title : "BIRTHDAY_REMINDER",
                    frequency : "year"
                };
                break;
            default:
                var message = {
                    title : "REVIEW_REMINDER",
                    frequency : "0"
                };
                break;
        }
        return message;
    }



    return {
        init: function () {
            $cordovaLocalNotification.getAll().then(function (notifications) {
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
            var property = getNotifiProperty(reminderInputObj.type);
            var title = $translate.instant(property.title);
            var notifiId = reminderInputObj.mode === "new" ? sdbmHash(reminderInputObj.notifiId) : reminderInputObj.notifiId;
            var thisService = this;

            //UNIT TEST
            //var notifi_time = Date.now() + 3000;
            //var frequency = "0";

            var params = {
                id: sdbmHash(reminderInputObj.notifiId),
                title: title,
                text: reminderInputObj.name,
                at: reminderInputObj.notifiTime,
                every: reminderInputObj.frequency,
                //sound: "file://sounds/reminder.mp3",
                icon: "img/icon.png",
                smallIcon: "img/icon.png",
                led: "fed82f",
                data: JSON.stringify(reminderInputObj.data)
            };

            $cordovaLocalNotification.schedule(params).then(function () {
                console.log('callback for adding background notification');
                thisService.init();
            });
        },
        //addIfNotExist: function (id,type,notifi_time,content) {
        //    var hash = sdbmHash(id);
        //    $cordovaLocalNotification.isScheduled(id).then(function (isScheduled) {
        //        console.log(isScheduled);
        //        if (!isScheduled) {
        //            add_notifi(id,type,notifi_time,content);
        //        }
        //    });
        //},
        //addFromArray: function (contact) {
        //    this.cancelAllById(contact.id);
        //    var reminder_array = contact.solar_reminder;
        //    angular.forEach(reminder_array, function (reminder, index) {
        //        if (reminder.value) {
        //            add_notifi(contact, parseInt(reminder.days));
        //        }
        //    });
        //},
        cancel: function (id) {
            var hash = sdbmHash(id);
            var thisService = this;
            $cordovaLocalNotification.cancel(hash).then(function (status) {
                console.log('callback for cancellation background notification');
                thisService.init();
            });
        },
        //cancelAllById: function (id) {
        //    var thisService = this;
        //    var days = [0, 1, 3, 7, 15, 30, 90, 180];
        //    angular.forEach(days, function (offset_days) {
        //        var notifi_id = id + "_day_" + offset_days;
        //        thisService.cancel(notifi_id);
        //    });
        //},
        //cancelAll: function () {
        //    $cordovaLocalNotification.cancelAll().then(function () {
        //        console.log('callback for canceling all background notifications');
        //    });
        //},
        //isExist: function (id) {
        //    $cordovaLocalNotification.isScheduled(id).then(function (isScheduled) {
        //        console.log(isScheduled);
        //    });
        //}
        getExistingCheckIds : function() {
            return check_id_g;
        }
    }
});