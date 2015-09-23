app.service('reminderService', function($rootScope,$q,$http,localNotificationService,clientListDbService,$toast,loadingService,errorHandler) {
    var reminders = [];
    $rootScope.$on("LOGOUT", function(){
        reminders = [];
    });

    var countdownMethod = {
        review   : calcNextDate,
        birthday : calcNextBirthday,
        maturity : calcNextDate,
    };
    var varNameEnum = {
        review   : "review",
        birthday : "birthday",
        maturity : "maturityDate",
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
    function getFirstTime(notifi_time,frequency) {
        var datetimeNow = moment();
        if (frequency = "year") {
            var notifi_this_year = notifi_time.clone().year(datetimeNow.year());
            //IF NOTIFY TIME IS BEFORE NOW, NOTIFY NEXT YEAR
            //ELSE SET NOTIFY THIS YEAR
            if (notifi_this_year.isAfter(datetimeNow)) {
                var output = notifi_this_year;
            } else {
                var output = notifi_time.clone().year(datetimeNow.year() + 1);
            }
        } else if (frequency = "month") {
            var notifi_this_year = notifi_time.clone().year(datetimeNow.year()).month(datetimeNow.month());
            //IF NOTIFY TIME IS BEFORE NOW, NOTIFY NEXT MONTH
            //ELSE SET NOTIFY THIS MONTH
            if (notifi_this_year.isAfter(datetimeNow)) {
                var output = notifi_this_year;
            } else {
                var output = notifi_time.clone().year(datetimeNow.year()).month(datetimeNow.month() + 1);
            }
        } else {
            var output = notifi_time;
        }
        return parseInt(output.format("x"));
    }
    function getCheckId(reminderInputObj) {
        if (reminderInputObj.type === "review") {
            reminderInputObj.userId = reminderInputObj.data.userId;
            return "REV-" + reminderInputObj.data.userId;
        } else if (reminderInputObj.type === "birthday") {
            reminderInputObj.userId = reminderInputObj.data.userId;
            return "BIR-" + reminderInputObj.data.userId;
        } else if (reminderInputObj.type === "maturity") {
            reminderInputObj.policyId = reminderInputObj.data.policyId;
            return "MAT-" + reminderInputObj.data.policyId;
        } else {

        }
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
        getMaturity : function() {
            var dfd = $q.defer();
            var thisService = this;

            $http.post(ctrl_url + "get_policy_maturity", {})
                .success(function(statusData) {
                    if (statusData.status === "OK") {
                        maturityArray = [];
                        angular.forEach(statusData.data,function(policy,index){
                            var obj = angular.copy(statusData.data[index]);
                            var maturityDate = moment(policy.maturityDate,"YYYY-MM-DD");
                            obj.maturityDate = maturityDate;
                            obj.type         = "maturity";
                            obj.countdown    = countdownMethod["maturity"](maturityDate);
                            obj.data         = obj;
                            obj.checkId      = getCheckId(obj);
                            obj.reminderSet  = thisService.checkReminderSet(obj.checkId);

                            if (obj.countdown >= 0) {
                                delete obj.data;
                                maturityArray.push(obj);
                            }
                        });
                        dfd.resolve(thisService.sort(maturityArray));
                    } else {
                        errorHandler.handleOthers(statusData.status);
                    }
                });

            return dfd.promise;
        },
        getBirthday : function() {
            var input = [];
            var clients_g = angular.copy(clientListDbService.getClients());
            for (var i = 0 ; i < clients_g.length ; i++) {
                var tempClient = clients_g[i];
                if (tempClient.birthday !== undefined) {
                    tempClient.countdown    = calcNextBirthday(tempClient.birthday);
                    tempClient.userId       = tempClient.id;
                    tempClient.type         = "birthday";
                    tempClient.data         = tempClient;
                    tempClient.checkId      = getCheckId(tempClient);
                    tempClient.reminderSet  = this.checkReminderSet(tempClient.checkId);
                    delete tempClient.id;
                    delete tempClient.data;
                    input.push(tempClient);
                }
            }
            input = _.sortBy(input, function(birthday){
                return birthday.countdown
            });
            return input;
        },
        getReview : function() {
            var input = [];
            var clients_g = angular.copy(clientListDbService.getClients());
            for (var i = 0 ; i < clients_g.length ; i++) {
                var tempClient = clients_g[i];
                tempClient.userId       = tempClient.id;
                tempClient.type         = "review";
                tempClient.data         = tempClient;
                tempClient.checkId      = getCheckId(tempClient);
                tempClient.reminderSet  = this.checkReminderSet(tempClient.checkId);
                delete tempClient.data;
                delete tempClient.id;
                input.push(tempClient);
            }
            input = _.sortBy(input, function(client){
                return client.name.toUpperCase();
            });
            return input;
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
                reminders_array[index].dateTime      = parseDate(reminder.dateTime);
                reminders_array[index].referenceDate = parseDate(reminder.referenceDate);
                reminders_array[index].countdownDays = parseDbInt(reminder.countdownDays);
                reminders_array[index].countdown     = countdownMethod[reminders_array[index].type](reminders_array[index].dateTime);
            });

            var output_array = [];
            angular.forEach(reminders_array, function(reminder,index){
                if (reminder.countdown >= 0) output_array.push(reminder);
            });
            return output_array;
        },
        checkReminderSet : function(checkId) {
            var checkIdArray = localNotificationService.getExistingCheckIds();
            var idFound = checkIdArray.indexOf(checkId) >= 0 ? true : false;
            return idFound;
        },
        add : function(reminderInputObj) {
            var thisService = this;
            var dfd = $q.defer();

            //ADD TO NOTIFICATION
            var frequency = repeatModeEnum[parseInt(reminderInputObj.frequency)];
            var firstTimeUnix = getFirstTime(reminderInputObj.dateTime,frequency);
            var diffInMinutes = (firstTimeUnix - Date.now()) / 1000 / 60;

            //IF NO REPEAT -> CHECK WHETHER TIME SET IS IN THE PAST
            if (frequency === "0" && diffInMinutes < 0.5) {
                $toast.show("REMINDER_PAST_ERROR");
                dfd.resolve("ERROR");
            } else {
                loadingService.show("SETTING_REMINDER");

                reminderInputObj.mode = reminderInputObj.id === undefined ? "new"       : "edit";
                reminderInputObj.id   = reminderInputObj.id === undefined ? unique_id() : reminderInputObj.id;
                var reminderObj = angular.copy(reminderInputObj);
                if (reminderObj.referenceDate !== undefined) reminderObj.referenceDate = reminderObj.referenceDate.toDate();
                if (reminderObj.dateTime !== undefined)      reminderObj.dateTime      = reminderObj.dateTime.toDate();
                //REMOVE OBJ TO POST TO API
                delete reminderObj.data;

                $http.post(ctrl_url + "set_reminder",reminderObj)
                    .success(function(statusData){
                        if (statusData["status"] === "success") {
                            //ADD TO NOTIFICATION
                            localNotificationService.add({
                                notifiId   : reminderInputObj.id,
                                type       : reminderInputObj.type,
                                mode       : reminderInputObj.mode,
                                notifiTime : firstTimeUnix,
                                name       : reminderInputObj.name,
                                frequency  : frequency,
                                data       : {
                                    checkId : getCheckId(reminderInputObj)
                                }
                            });

                            //PUSH TO ARRAY
                            reminderInputObj["countdown"] = countdownMethod[reminderInputObj.type](reminderInputObj.dateTime);
                            reminderInputObj["dateTime"]  = reminderInputObj.dateTime;
                            reminderInputObj[varNameEnum[reminderInputObj.type]] = reminderInputObj.referenceDate;
                            delete reminderInputObj.data;
                            pushToArray(reminderInputObj.mode,reminderInputObj);

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