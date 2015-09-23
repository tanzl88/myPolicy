app.controller('BirthdayCtrl', function($scope,$translate,$timeout,$http,$toast,modalService,reminderService,clientListDbService,localNotificationService,loadingService) {
    $scope.showDateTimePicker = {};
    $scope.showCountdownTimePicker = {};
    $scope.initVar = function() {
        $scope.reminderMenu = false;
        $scope.reminders = reminderService.get();
        $scope.displayReminderIndex = $scope.displayReminderIndex === undefined ? -1 : $scope.displayReminderIndex - 1;
        $scope.reminderSortingIndex = $scope.reminderSortingIndex === undefined ? -1 : $scope.reminderSortingIndex - 1;
        $scope.changeReminderDisplay();
        $scope.changeReminderSorting();
        //LOCAL NOTIFICATION
        localNotificationService.init();
    };
    $scope.toggleReminderMenu = function() {
        $scope.reminderMenu = !$scope.reminderMenu;
    };

    // --------------- INTERACTION MENU ---------------
    var originatorEv;
    $scope.toggleMenu = function() {
        $timeout(function(){
            $("#reminderMenuTrigger").click();
        },1);
    };
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    // --------------- EDIT REMINDER CLICK ---------------
    $scope.changeReminderDisplay = function() {
        var nextIndex = ($scope.displayReminderIndex + 1) % reminder_display_g.length;
        $scope.updateReminderDisplay(nextIndex);
    };
    $scope.updateReminderDisplay = function(index) {
        var reminderDisplayObj = reminder_display_g[index];
        $scope.displayReminderIndex = index;
        $scope.displayReminder = $translate.instant(reminderDisplayObj.name);
        $scope.reminderFilter = reminderDisplayObj.filter;
    };
    $scope.changeReminderSorting = function() {
        var nextIndex = ($scope.reminderSortingIndex + 1) % reminder_sort_g.length;
        $scope.updateReminderSorting(nextIndex);
    };
    $scope.updateReminderSorting = function(index) {
        var reminderSortObj = reminder_sort_g[index];
        $scope.reminderSortingIndex = index;
        $scope.reminderSortingText = $translate.instant(reminderSortObj.name);
        $scope.reminders = _.sortBy($scope.reminders, function(reminder){
            return reminder[reminderSortObj.sortCol];
        });
    };


    // --------------- EDIT REMINDER CLICK ---------------
    $scope.editReminder = function(type,index) {
        var reminder = $scope.reminders[index];
        var reminderModal = $scope.reminderModal[type];
        console.log(reminder);
        $scope["show" + reminderModal.type + "TimePicker"][reminderModal.pickerName]({
            data        : reminder,
            placeholder : reminder.name
        });
    };


    // --------------- MODAL ---------------
    $scope.reminderModal = {
        "birthday" : {
            name        : "birthday",
            type        : "Countdown",
            dataName    : "birthdays",
            pickerName  : "annual",
            modalName   : "birthdayModal",
            dataSource  : function() {
                $scope.birthdays = reminderService.getBirthday();
            },
        },
        "maturity" : {
            name        : "maturity",
            type        : "Countdown",
            dataName    : "maturityData",
            pickerName  : "maturity",
            modalName   : "maturityModal",
            dataSource  : function() {
                loadingService.show("LOADING");
                reminderService.getMaturity().then(function(data){
                    $scope.maturityData = data;
                    loadingService.hide();
                });
            },
        },
        "review" : {
            name        : "review",
            type        : "Date",
            dataName    : "reviews",
            pickerName  : "oneTime",
            modalName   : "reviewModal",
            dataSource  : function() {
                $scope.reviews = reminderService.getReview();
            },
        },
    };
    //angular.forEach($scope.reminderModal,function(modal,index){
    //    modalService.init(modal.name,modal.name,$scope).then(function(modal){
    //        $scope[modal.modalName] = modal;
    //    });
    //});

    $scope.openReminderModal = function(type) {
        $scope.toggleReminderMenu();
        var reminderModal = $scope.reminderModal[type];
        reminderModal.dataSource();
        $scope[reminderModal.modalName].show();
    };
    $scope.reminderItemClick = function(type,index) {
        var reminderModal = $scope.reminderModal[type];
        var item = $scope[reminderModal.dataName][index];
        $scope["show" + reminderModal.type + "TimePicker"][reminderModal.pickerName]({
            data        : item,
            placeholder : $translate.instant("ONE_" + reminderModal.name.toUpperCase(),{ name : item.name})
        });
    };

    modalService.init("birthday","birthday",$scope).then(function(modal){
        $scope.birthdayModal = modal;
    });

    modalService.init("maturity","maturity",$scope).then(function(modal){
        $scope.maturityModal = modal;
    });

    modalService.init("review","review",$scope).then(function(modal){
        $scope.reviewModal = modal;
    });


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

    // --------------- UTILITY ---------------
    $scope.closeEverything = function() {
        $scope.initVar();
        loadingService.hide();
        $scope.removeModal.hide();
        $scope.birthdayModal.hide();
        $scope.reviewModal.hide();
        $scope.maturityModal.hide()
    };

});