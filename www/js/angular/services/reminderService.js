app.service('reminderService', function($rootScope,$q,$http,localNotificationService,clientListDbService,$toast,loadingService,errorHandler) {
    var reminders = [];
    $rootScope.$on("LOGOUT", function(){
        reminders = [];
    });

    //MAP TYPE -> ARRAY VAR NAME
    var varNameEnum = {
        review   : "review",
        birthday : "birthday",
        maturity : "maturityDate",
        payment  : "payment",
    };
    //MAP TYPE -> REFERENCE ID TYPE USED
    var referenceIdType = {
        review   : "userId",
        birthday : "userId",
        maturity : "policyId",
        payment  : "policyId"
    };

    function wasInThePast(momentDate) {
        var momentNow = moment();
        var momentNowZeroHour = moment([momentNow.year(),momentNow.month(),momentNow.date()]);
        var momentDateZeroHour = moment([momentDate.year(),momentDate.month(),momentDate.date()]);
        //IF NOW IS AFTER INPUT DATE, THE DATE WAS IN THE PAST
        //return momentNow.isAfter(momentDate,"day");
        return momentDateZeroHour.diff(momentNowZeroHour,"day");
    }
    function parseFrequencyToCordovaName(frequency) {
        if (frequency === "0" || frequency === "month" || frequency === "quarter" || frequency === "year") {
            return frequency;
        } else {
            for (var i = 0 ; i < repeatModeEnum.length ; i++) {
                if (repeatModeEnum[i].order === frequency) {
                    return repeatModeEnum[i].cordova;
                    break;
                }
            }
        }
    }
    //function parsePolicyIndexToIndex(policyIndex) {
    //    for (var i = 0 ; i < repeatModeEnum.length ; i++) {
    //        if (repeatModeEnum[i].policy === policyIndex) {
    //            return repeatModeEnum[i].order;
    //            break;
    //        }
    //    }
    //}
    function convertRepeatIndex(policyIndex,from,to) {
        for (var i = 0 ; i < repeatModeEnum.length ; i++) {
            if (repeatModeEnum[i][from] === policyIndex) {
                return repeatModeEnum[i][to];
                break;
            }
        }
    }
    function getCountdown(momentDate,frequency) {
        var frequency = parseFrequencyToCordovaName(frequency);
        if (frequency === "0") {
            return wasInThePast(momentDate);
        } else {
            var countdown = wasInThePast(momentDate);
            if (frequency === "quarter") {
                var loopCount = Math.floor(Math.max(0,moment().diff(momentDate,"months",true) / 3) - 3);
            } else if (frequency === "semiannual") {
                var loopCount = Math.floor(Math.max(0,moment().diff(momentDate,"months",true) / 6) - 3);
            } else {
                var loopCount = Math.max(0,moment().diff(momentDate,frequency + "s") - 3);
            }

            while(countdown < 0) {
                loopCount++;
                if (frequency === "semiannual") {
                    countdown = wasInThePast(momentDate.clone.add(6 * loopCount,"months"));
                } else {
                    countdown = wasInThePast(momentDate.clone().add(loopCount,frequency + "s"));
                }
            }
            return countdown;
        }
    }
    function getFirstTime(momentDate,frequency) {
        var frequency = parseFrequencyToCordovaName(frequency);
        if (frequency === "0") {
            return momentDate;
        } else {
            var countdown = wasInThePast(momentDate);
            if (frequency === "quarter") {
                var loopCount = Math.floor(Math.max(0,moment().diff(momentDate,"months",true) / 3) - 3);
            } else if (frequency === "semiannual") {
                var loopCount = Math.floor(Math.max(0,moment().diff(momentDate,"months",true) / 6) - 3);
            } else {
                var loopCount = Math.max(0,moment().diff(momentDate,frequency + "s") - 3);
            }

            while(countdown < 0) {
                loopCount++;
                if (frequency === "semiannual") {
                    countdown = wasInThePast(momentDate.clone.add(6 * loopCount,"months"));
                } else {
                    countdown = wasInThePast(momentDate.clone().add(loopCount,frequency + "s"));
                }
            }

            return momentDate.clone().add(loopCount,frequency + "s");
        }
    }
    function parseDbInt(input) {
        if (!validity_test(input)) {
            return undefined;
        } else {
            return parseInt(input);
        }
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
            reminderInputObj.policyId = reminderInputObj.data.policyId;
            return "PAY-" + reminderInputObj.data.policyId;
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
    //function parseFrequency(frequencyIndex) {
    //    for (var i = 0 ; i < repeatModeEnum.length ; i++) {
    //        if (repeatModeEnum[i].index === frequencyIndex) {
    //            return repeatModeEnum[i].order;
    //            break;
    //        }
    //    }
    //}

    return {
        get : function() {
            return this.sort(reminders);
        },
        getMaturity : function() {
            var dfd = $q.defer();
            var thisService = this;

            //ANALYTICS
            if (ionic.Platform.isWebView()) window.analytics.trackEvent('Reminder', "maturity", "View");

            $http.post(ctrl_url + "get_policy_maturity", {})
                .success(function(statusData) {
                    if (statusData.status === "OK") {
                        maturityArray = [];
                        angular.forEach(statusData.data,function(policy,index){
                            var obj = angular.copy(statusData.data[index]);
                            var maturityDate = moment(policy.maturityDate,"YYYY-MM-DD");
                            obj.maturityDate = maturityDate;
                            obj.type         = "maturity";
                            obj.countdown    = getCountdown(maturityDate,"0");
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
        getPayment : function() {
            var dfd = $q.defer();
            var thisService = this;

            //ANALYTICS
            if (ionic.Platform.isWebView()) window.analytics.trackEvent('Reminder', "payment", "View");

            $http.post(ctrl_url + "get_policy_payment", {})
                .success(function(statusData) {
                    if (statusData.status === "OK") {
                        paymentArray = [];
                        angular.forEach(statusData.data,function(policy,index){
                            var obj = angular.copy(statusData.data[index]);
                            var startDate = moment(policy.startDate,"YYYY-MM-DD");
                            obj.frequency    = convertRepeatIndex(parseDbInt(policy.premiumMode),"policy","order");
                            obj.freqTitle    = convertRepeatIndex(parseDbInt(policy.premiumMode),"policy","translate").replace("REPEAT_","PAYMENT_");
                            //obj.frequency    = parsePolicyIndexToIndex(parseDbInt(policy.premiumMode));
                            obj.startDate    = startDate;
                            obj.dateTime     = startDate;
                            obj.type         = "payment";
                            obj.countdown    = getCountdown(startDate,obj.frequency);
                            obj.data         = obj;
                            obj.checkId      = getCheckId(obj);
                            obj.reminderSet  = thisService.checkReminderSet(obj.checkId);
                            delete obj.data;
                            paymentArray.push(obj);
                        });
                        dfd.resolve(thisService.sort(paymentArray));
                    } else {
                        errorHandler.handleOthers(statusData.status);
                    }
                });

            return dfd.promise;
        },
        getBirthday : function() {
            var input = [];
            var clients_g = angular.copy(clientListDbService.getClients());

            //ANALYTICS
            if (ionic.Platform.isWebView()) window.analytics.trackEvent('Reminder', "birthday", "View");

            for (var i = 0 ; i < clients_g.length ; i++) {
                var tempClient = clients_g[i];
                if (tempClient.birthday !== undefined) {
                    tempClient.countdown    = getCountdown(tempClient.birthday,"year");
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
            //ANALYTICS
            if (ionic.Platform.isWebView()) window.analytics.trackEvent('Reminder', "review", "View");

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
            //reminders = [reminders[0]];
            var thisService = this;
            //CANCEL ALL THEN REASSIGN ALLL
            localNotificationService.cancelAll().then(function(){
                var reminder_array = [];
                angular.forEach(reminders,function(reminder,index){
                    if (validity_test(reminder.referenceId)) {
                        //ADD TO NOTIFICATION
                        var frequency = repeatModeEnum[parseInt(reminder.frequency)].cordova;
                        var firstTimeUnix = getFirstTime(reminder.dateTime,frequency);
                        var diffInMinutes = (firstTimeUnix - Date.now()) / 1000 / 60;
                        //IF NO REPEAT -> CHECK WHETHER TIME SET IS IN THE PAST
                        if (frequency === "0" && diffInMinutes < 0) {
                            console.log("expired");
                        } else {
                            reminder.notifiTime = firstTimeUnix;
                            reminder_array.push(reminder);
                            //thisService.addLocalNotification(reminder);
                        }
                    }
                });
                thisService.addLocalNotifications(reminder_array);
            });
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
                reminder.freqTitle     = convertRepeatIndex(parseDbInt(reminder.frequency),"index","translate");
                reminder.frequency     = convertRepeatIndex(parseDbInt(reminder.frequency),"index","order");
                reminder.dateTime      = parseDate(reminder.dateTime);
                reminder.referenceDate = parseDate(reminder.referenceDate);
                reminder.countdownDays = parseDbInt(reminder.countdownDays);
                reminder.countdown     = getCountdown(reminder.dateTime,reminder.frequency)
                reminder.data          = {};
                reminder.data[referenceIdType[reminder.type]] = reminder.referenceId;
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
        addLocalNotification : function(reminderInputObj) {
            var frequency = repeatModeEnum[parseInt(reminderInputObj.frequency)].cordova;
            var firstTimeUnix = getFirstTime(reminderInputObj.dateTime,frequency);
            localNotificationService.add({
                notifiId   : reminderInputObj.id,
                type       : reminderInputObj.type,
                mode       : reminderInputObj.mode,
                //notifiTime : firstTimeUnix,
                notifiTime : reminderInputObj.dateTime.format("x"),
                name       : reminderInputObj.name,
                frequency  : frequency,
                data       : {
                    id         : sdbmHash(reminderInputObj.id),
                    checkId    : getCheckId(reminderInputObj),
                    repeating  : frequency,
                    originDate : reminderInputObj.dateTime.format("x")
                }
            });
        },
        addLocalNotifications : function(reminderInputObjArray) {
            var localNotifiArray = [];
            angular.forEach(reminderInputObjArray,function(reminderInputObj,index){
                var localNotifi = {
                    notifiId   : reminderInputObj.id,
                    type       : reminderInputObj.type,
                    mode       : reminderInputObj.mode,
                    notifiTime : reminderInputObj.dateTime.format("x"),
                    name       : reminderInputObj.name,
                    frequency  : repeatModeEnum[parseInt(reminderInputObj.frequency)].cordova,
                    data       : {
                        id         : sdbmHash(reminderInputObj.id),
                        checkId    : getCheckId(reminderInputObj),
                        repeating  : repeatModeEnum[parseInt(reminderInputObj.frequency)].cordova,
                        originDate : reminderInputObj.dateTime.format("x")
                    }
                };
                localNotifiArray.push(localNotifi);
            });
            localNotificationService.addMultiple(localNotifiArray);
        },
        addToLocalNotificationAndArray : function(reminderInputObj) {
            //ADD TO NOTIFICATION
            this.addLocalNotification(reminderInputObj);

            //PUSH TO ARRAY
            reminderInputObj["freqTitle"] = convertRepeatIndex(reminderInputObj.frequency,"order","translate");
            reminderInputObj["countdown"] = getCountdown(reminderInputObj.dateTime,reminderInputObj.frequency);
            reminderInputObj["dateTime"]  = reminderInputObj.dateTime;
            reminderInputObj[varNameEnum[reminderInputObj.type]] = reminderInputObj.referenceDate;
            delete reminderInputObj.data;
            pushToArray(reminderInputObj.mode,reminderInputObj);
        },
        processReminderInputObj : function(reminderInputObj) {
            reminderInputObj.mode = reminderInputObj.id === undefined ? "new"       : "edit";
            reminderInputObj.id   = reminderInputObj.id === undefined ? unique_id() : reminderInputObj.id;
            reminderInputObj.referenceId = reminderInputObj.referenceId === undefined ? reminderInputObj.data[referenceIdType[reminderInputObj.type]] : reminderInputObj.referenceId;
            return reminderInputObj;
        },
        getPostData : function(reminderInputObj) {
            var reminderObj = angular.copy(reminderInputObj);
            //CONVERT FREQUENCY FROM ORDER TO INDEX
            reminderObj.frequency = repeatModeEnum[reminderObj.frequency].index;
            if (reminderObj.referenceDate !== undefined) reminderObj.referenceDate = reminderObj.referenceDate.toDate();
            if (reminderObj.dateTime !== undefined)      reminderObj.dateTime      = reminderObj.dateTime.toDate();
            //REMOVE OBJ TO POST TO API
            delete reminderObj.data;
            return reminderObj;
        },
        add : function(reminderInputObj) {
            var thisService = this;
            var dfd = $q.defer();

            //ADD TO NOTIFICATION
            var frequency = repeatModeEnum[parseInt(reminderInputObj.frequency)].cordova;
            var firstTimeUnix = getFirstTime(reminderInputObj.dateTime,frequency);
            var diffInMinutes = (firstTimeUnix - Date.now()) / 1000 / 60;

            //IF NO REPEAT -> CHECK WHETHER TIME SET IS IN THE PAST
            if (frequency === "0" && diffInMinutes < 0.5) {
                $toast.show("REMINDER_PAST_ERROR");
                dfd.resolve("ERROR");
            } else {
                loadingService.show("SETTING_REMINDER");

                reminderInputObj = thisService.processReminderInputObj(reminderInputObj);
                var reminderObj = thisService.getPostData(reminderInputObj);

                //ANALYTICS
                if (ionic.Platform.isWebView()) window.analytics.trackEvent('Reminder', reminderInputObj.type, "Single");

                $http.post(ctrl_url + "set_reminder",reminderObj)
                    .success(function(statusData){
                        if (statusData["status"] === "success") {
                            thisService.addToLocalNotificationAndArray(reminderInputObj);
                            loadingService.hide();

                            dfd.resolve("OK");
                        } else {
                            errorHandler.handleOthers(statusData["status"]);
                        }
                    });
            }

            return dfd.promise;
        },
        addMultiple : function(reminderInputObjArray) {
            var thisService = this;
            var dfd = $q.defer();

            loadingService.show("SETTING_REMINDER");

            var reminderObjArray = [];
            angular.forEach(reminderInputObjArray,function(reminderInputObj,index){
                reminderInputObjArray[index] = thisService.processReminderInputObj(reminderInputObj);
                var reminderObj = thisService.getPostData(reminderInputObj);
                reminderObjArray.push(reminderObj);
            });

            //ANALYTICS
            if (ionic.Platform.isWebView()) window.analytics.trackEvent('Reminder', reminderObjArray[0].type, "Multiple");

            $http.post(ctrl_url + "set_reminders",{
                data : JSON.stringify(reminderObjArray)
            })
                .success(function(statusData){
                    if (statusData["status"] === "OK") {
                        angular.forEach(reminderInputObjArray,function(reminderInputObj,index){
                            thisService.addToLocalNotificationAndArray(reminderInputObj);
                        });
                        loadingService.hide();

                        dfd.resolve("OK");
                    } else {
                        errorHandler.handleOthers(statusData["status"]);
                    }
                });

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