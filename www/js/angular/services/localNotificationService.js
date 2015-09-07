app.service('localNotificationService', function ($rootScope, $state, $ionicHistory, $cordovaLocalNotification, $translate) {
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


    function add_notifi(id,type,notifi_time,content,frequency) {
        var property = getNotifiProperty(type);
        var title = $translate.instant(property.title);

        //var notifi_time = Date.now() + 3000;

        $cordovaLocalNotification.schedule({
            id: sdbmHash(id),
            title: title,
            text: content,
            at: notifi_time,
            every: frequency,
            //sound: "file://sounds/reminder.mp3",
            icon: "img/icon.png",
            smallIcon: "img/icon.png",
            led: "fed82f",
            //data: JSON.stringify({contactId: contact.id})
        }).then(function () {
            console.log('callback for adding background notification');
        });
    }


    return {
        init: function () {
            //$rootScope.$on('$cordovaLocalNotification:click', function (event, notification, state) {
            //    //GO TO BIRTHDAY DETAILS PAGE OF PERSON CLICKED
            //    var data_obj = JSON.parse(notification.data);
            //    var contact_id = data_obj.contactId;
            //    $rootScope.contact_id = contact_id;
            //
            //    var stateNameSplit = $state.current.name.split(".");
            //    var stateName = stateNameSplit[stateNameSplit.length - 1];
            //    //IF VIEW IS DETAILS -> INIT VAR ELSE GO TO STATE
            //    if (stateName === "bd_details") {
            //        $("#birthday_details_view").scope().initVar();
            //    } else if (stateName === "bd_edit") {
            //        $ionicHistory.goBack();
            //        $("#birthday_details_view").scope().initVar();
            //    } else {
            //        $state.go("tabs.birthday.bd_details");
            //    }
            //
            //});
            //$rootScope.$on('$cordovaLocalNotification:trigger', function (event, notification, state) {
            //    console.log(notification);
            //});
        },
        add: function (id,type,notifi_time,content) {
            add_notifi(id,type,notifi_time,content);
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
            $cordovaLocalNotification.cancel(hash).then(function (status) {
                console.log('callback for cancellation background notification');
                console.log(status);
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
    }
});