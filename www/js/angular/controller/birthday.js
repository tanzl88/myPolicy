app.controller('BirthdayCtrl', function($scope,$translate,clientListDbService,modalService,reminderService,loadingService) {
    $scope.showDateTimePicker = {};
    $scope.initVar = function() {
        $scope.birthdays = clientListDbService.getClientsBirthday();
        $scope.reminderMenu = false;
        $scope.reminders = reminderService.get();
    };
    $scope.toggleReminderMenu = function() {
        $scope.reminderMenu = !$scope.reminderMenu;
    };
    $scope.editReminder = function(index) {
        var reminder = $scope.reminders[index];
        var type = reminder.type;
        if (type === "review") {
            $scope.showDateTimePicker["oneTime"](reminder.name,reminder.dateTime,reminder.id,reminder.frequency);
        } else if (type === "birthday") {
            $scope.showDateTimePicker["annual"](reminder.name,reminder.dateTime,reminder.id,reminder.frequency);
        }
    };
    $scope.closeEverything = function() {
        $scope.initVar();
        loadingService.hide();
        $scope.closeBirthday();
    }



    // --------------- MODAL ---------------
    $scope.openBirthday = function() {
        $scope.toggleReminderMenu();
        modalService.open("birthday",$scope.birthday);
    };
    $scope.closeBirthday = function() {
        modalService.close("birthday");
    };
    $scope.birthdayClick = function(index) {
        var birthday_item = $scope.birthdays[index];
        var birthday_name = $translate.instant("ONE_BIRTHDAY",{ name : birthday_item.name});
        var birthday_date = moment([birthday_item.birthday.year(),birthday_item.birthday.month(),birthday_item.birthday.date(),9]);
        $scope.showDateTimePicker["annual"](birthday_name,birthday_date);
    };

    modalService.init("birthday","birthday",$scope);

    // ------------ REMOVE ------------
    function hideEverything() {
        loadingService.hide();
        $scope.removeModal.hide();
    }
    $scope.remove = function(id) {
        $scope.removeId = id;
        $scope.removeModal.show();
    };
    $scope.confirmRemove = function() {
        loadingService.show("REMOVING_POLICY");
        reminderService.removeReminderById($scope.removeId).then(function(status){
            if (status === "OK") {
                $scope.reminders = reminderService.get();
            } else if (status === "failed") {
                $toast.show("REMOVE_POLICY_NOT_FOUND");
            }
            hideEverything();
        });
    };
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("REMINDER_REMOVE_MSG");

});

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