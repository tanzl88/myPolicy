app.service('reminderService', function($rootScope,$q,$http,localNotificationService,$toast,loadingService,errorHandler) {
    var reminders = [];
    $rootScope.$on("LOGOUT", function(){
        reminders = [];
    });

    var countdownMethod = {
        review   : calcNextDate,
        birthday : calcNextBirthday
    };
    var repeatModeEnum = [
        "year",
        "month",
        "0"
    ];

    function calcNextBirthday(momentBirthday) {
        var momentToday   = moment();
        var momentNow     = moment([momentToday.year(),momentToday.month(),momentToday.date()]);
        var thisYear = momentToday.year();
        var month    = momentBirthday.month();
        var date     = momentBirthday.date();
        var thisYearBirthday = moment([thisYear,month,date]);
        if (momentNow.isBefore(thisYearBirthday,"day")) {
            var nextBirthday = thisYearBirthday;
            return thisYearBirthday.diff(momentNow,"day");

        } else if (momentNow.isAfter(thisYearBirthday,"day")) {
            var nextBirthday = moment([thisYear + 1,month,date]);
            return nextBirthday.diff(momentNow,"day");
        } else {
            return 0;
        }
    }
    function calcNextDate(momentDate) {
        var momentToday   = moment();
        var momentNow     = moment([momentToday.year(),momentToday.month(),momentToday.date()]);
        var momentDateAdj = moment([momentDate.year(),momentDate.month(),momentDate.date()]);
        return momentDateAdj.diff(momentNow,"day");
    }

    function pushToArray(mode,reminderObj) {
        if (mode === "new") {
            reminders.push(reminderObj);
        } else {
            for (var i = 0; i < reminders.length; i++) {
                if (reminders[i].id === reminderObj.id) {
                    reminders[i] = reminderObj;
                }
            }
        }
    }
    function parseDate(dateString) {
        if (!validity_test(dateString) || dateString === "0000-00-00 00:00:00") {
            return undefined;
        } else {
            return moment(dateString,"YYYY-MM-DD HH:mm:ss");
        }
    }

    return {
        get : function() {
            return this.sort(reminders);
        },
        set : function(reminders_array) {
            reminders = this.processReminders(reminders_array);
        },
        sort : function(reminders_array) {
            var toBeSortArray = reminders_array === undefined ? reminders : reminders_array;
            var sortedArray = _.sortBy(reminders_array, function(reminder){
                return reminder.countdown;
            });

            if (reminders_array === undefined) {
                reminders = sortedArray;
            } else {
                return sortedArray;
            }
        },
        processReminders : function(reminders_array) {
            angular.forEach(reminders_array, function(reminder,index){
                reminders_array[index].dateTime  = parseDate((reminder.dateTime));
                reminders_array[index].countdown = countdownMethod[reminders_array[index].type](reminders_array[index].dateTime);
            });

            var output_array = [];
            angular.forEach(reminders_array, function(reminder,index){
                if (reminder.countdown >= 0) output_array.push(reminder);
            });
            return output_array;
        },
        add : function(id,name,type,dateTime,repeatMode) {
            var thisService = this;
            var dfd = $q.defer();


            //ADD TO NOTIFICATION
            var frequency = repeatModeEnum[repeatMode];
            var unixTime = parseInt(dateTime.format("x"));
            var diff = unixTime - Date.now();
            var diffInMinutes = diff / 1000 / 60;

            //IF NO REPEAT -> CHECK WHETHER TIME SET IS IN THE PAST
            if (frequency === "0" && diffInMinutes < 0.5) {
                $toast.show("REMINDER_PAST_ERROR");
                dfd.resolve("ERROR");
            } else {
                loadingService.show("SETTING_REMINDER");
                var mode     = id === undefined ? "new"       : "edit";
                var notifiId = id === undefined ? unique_id() : id;
                var reminderObj = {
                    id          : notifiId,
                    name        : name,
                    type        : type,
                    frequency   : repeatMode,
                    dateTime    : dateTime.toDate()
                };

                $http.post(ctrl_url + "set_reminder",reminderObj)
                    .success(function(statusData){
                        if (statusData["status"] === "success") {
                            //PUSH TO ARRAY
                            reminderObj["countdown"] = countdownMethod[type](dateTime);
                            reminderObj["dateTime"]  = dateTime;
                            pushToArray(mode,reminderObj);
                            //ADD TO NOTIFICATION
                            localNotificationService.add(notifiId,type,unixTime,name,frequency);
                            loadingService.hide();

                            dfd.resolve("OK");
                        } else {
                            errorHandler.handleOthers(statusData["status"]);
                        }
                    });
            }

            return dfd.promise;

        },
        removeReminderById : function(id) {
            var dfd = $q.defer();

            var input = {
                id : id
            };
            $http.post(ctrl_url + "remove_reminder", input)
                .success(function(status){
                    if (status === "OK") {
                        //REMOVE FROM ARRAY
                        for (var i = 0 ; i < reminders.length ; i++ ) {
                            if (reminders[i].id === id) {
                                reminders.splice(i,1);
                                break;
                            }
                        }
                        //REMOVE FROM NOTIFICATION
                        localNotificationService.cancel(id);
                    }
                    dfd.resolve(status);
                });

            return dfd.promise;
        }
    }
});