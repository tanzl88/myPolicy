app.controller('ReminderCtrl', ['$scope', '$translate', '$timeout', '$http', '$toast', 'modalService', 'reminderService', 'clientListDbService', 'localNotificationService', 'loadingService', 'credentialManager', function($scope,$translate,$timeout,$http,$toast,modalService,reminderService,clientListDbService,localNotificationService,loadingService,credentialManager) {
    $scope.showDateTimePicker = {};
    $scope.showCountdownTimePicker = {};
    $scope.initVar = function() {
        $scope.reminderMenu = false;
        $scope.reminders = reminderService.get();
        $scope.displayReminderIndex = -1;
        $scope.reminderSortingIndex = -1;
        $scope.reminderSelectionModeIndex = -1;
        $scope.changeReminderDisplay();
        $scope.changeReminderSorting();
        $scope.changeReminderSelectionMode();
        //LOCAL NOTIFICATION -> TO REFRESH CHECK ID
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

    // --------------- FILTER REMINDER ---------------
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

    $scope.changeReminderSelectionMode = function(type) {
        var nextIndex = ($scope.reminderSelectionModeIndex + 1) % reminder_selection_mode_g.length;
        $scope.updateReminderSelectionMode(nextIndex,type);
    };
    $scope.updateReminderSelectionMode = function(index,type) {
        $scope.reminderSelectionModeIndex = index;
        $scope.reminderSelectionMode = $translate.instant(reminder_selection_mode_g[index]);
        if (type !== undefined) {
            var data = $scope[$scope.reminderModal[type].dataName];
            if (index === 0) {
                angular.forEach(data,function(item,index){
                    delete item.selected;
                });
            } else if (index === 1) {
                angular.forEach(data,function(item,index){
                    if (!item.reminderSet) item.selected = true;
                });
            } else {
                angular.forEach(data,function(item,index){
                    item.selected = true;
                });
            }
        }
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
            disallow    : [0,1],
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
            disallow    : [0],
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
            disallow    : [0,1],
            dataSource  : function() {
                $scope.reviews = reminderService.getReview();
            },
        },
        "payment" : {
            name        : "payment",
            type        : "Date",
            dataName    : "paymentData",
            pickerName  : "oneTime",
            modalName   : "paymentModal",
            disallow    : [0],
            dataSource  : function() {
                reminderService.getPayment().then(function(data){
                    $scope.paymentData = data;
                    loadingService.hide();
                });
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

        if (reminderModal.disallow.indexOf(credentialManager.getSubscription().type) >= 0) {
            credentialManager.showUpgradeAccountModal();
        } else {
            reminderModal.dataSource();
            $scope[reminderModal.modalName].show();
        }
    };
    $scope.reminderItemClick = function(type,index) {
        var reminderModal = $scope.reminderModal[type];
        var item = $scope[reminderModal.dataName][index];
        if ($scope.reminderSelectionModeIndex === 0) {
            $scope["show" + reminderModal.type + "TimePicker"][reminderModal.pickerName]({
                data        : item,
                placeholder : $translate.instant("ONE_" + reminderModal.name.toUpperCase(),{ name : item.name, company : item.company })
            });
        } else {
            item.selected = !item.selected;
        }
    };
    $scope.multipleReminderClick = function(type) {
        var selectedReminders = [];
        var reminderModal = $scope.reminderModal[type];
        var reminders = $scope[reminderModal.dataName];
        angular.forEach(reminders,function(reminder,index){
            if (reminder.selected) selectedReminders.push(reminder);
        });
        $scope["show" + reminderModal.type + "TimePicker"][reminderModal.pickerName]({
            data        : selectedReminders,
            placeholder : undefined
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
    modalService.init("payment","payment",$scope).then(function(modal){
        $scope.paymentModal = modal;
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
        $scope.maturityModal.hide();
        $scope.paymentModal.hide();
    };

}]);