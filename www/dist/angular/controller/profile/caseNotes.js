app.controller('CaseNotesCtrl', ['$scope', '$rootScope', '$http', '$state', '$translate', '$toast', '$timeout', 'modalService', 'loadingService', 'errorHandler', function($scope,$rootScope,$http,$state,$translate,$toast,$timeout,modalService,loadingService,errorHandler) {
    function parseDate(dateString) {
        if (!validity_test(dateString) || dateString === "0000-00-00") {
            return undefined;
        } else {
            return moment(dateString,"YYYY-MM-DD").format("LL")
        }
    };

    $scope.initVar = function() {
        loadingService.show("LOADING_NOTES");
        $http.post(ctrl_url + "get_case_notes", {})
            .success(function(statusData){
                if (statusData["status"] === "OK") {
                    angular.forEach(statusData.data, function(note,index){
                        statusData.data[index].date = parseDate(note.date);
                    });
                    $scope.caseNotes = statusData.data;
                    loadingService.hide();
                } else {
                    errorHandler.handleOthers(statusData["status"]);
                }
            });

    };
    $scope.addNotes = function() {
        $state.go("tabs.profile.caseNotes.addCaseNotes");
    };
    $scope.editNotes = function(index) {
        $rootScope.caseNotesMode  = "edit";
        $rootScope.editNotes = $scope.caseNotes[index];
        $state.go("tabs.profile.caseNotes.addCaseNotes");
    };


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
        loadingService.show("REMOVING_NOTE");
        var input = {
            id : $scope.removeId
        }
        $http.post(ctrl_url + "remove_case_notes", input)
            .success(function(status){
                if (status === "OK") {
                    for (var i = 0 ; i < $scope.caseNotes.length ; i++) {
                        if ($scope.caseNotes[i].id === $scope.removeId) {
                            $scope.caseNotes.splice(i,1);
                            break;
                        }
                    }
                    hideEverything();
                } else {
                    errorHandler.handleOthers(status);
                }
            });
    };
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("NOTE_REMOVE_MSG");
}]);

app.controller('AddCaseNotesCtrl', ['$scope', '$rootScope', '$http', '$state', '$timeout', '$ionicHistory', 'loadingService', 'errorHandler', function($scope,$rootScope,$http,$state,$timeout,$ionicHistory,loadingService,errorHandler) {
    $scope.initVar = function() {
        var caseNotesMode = $rootScope.caseNotesMode;
        delete $rootScope.caseNotesMode;
        if (caseNotesMode === "edit") {
            $scope.notesObj = $rootScope.editNotes;
            delete $rootScope.editNotes;
        } else {
            $scope.notesObj = {
                id    : undefined,
                date  : undefined,
                notes : undefined
            };
        }
        //RESET FORM
        var caseNotesForm = $("#caseNotesForm").scope().caseNotesForm;
        caseNotesForm.date.$setPristine();
        caseNotesForm.notes.$setPristine();
    };

    $scope.submitButton = function() {
        $timeout(function(){
            $("#caseNoteSubmit").click();
        },1);
    };

    $scope.submit = function(caseNotesForm) {
        if (caseNotesForm.$invalid) {
            caseNotesForm.date.$setDirty();
            caseNotesForm.notes.$setDirty();
        } else {
            loadingService.show("SUBMITTING");
            var input = {
                date  : moment(caseNotesForm.date.$modelValue,"LL").toDate(),
                notes : caseNotesForm.notes.$modelValue
            };
            if ($scope.notesObj.id !== undefined) input.id = $scope.notesObj.id;

            $http.post(ctrl_url + "set_case_notes", input)
                .success(function(status){
                    if (status === "OK") {
                        $("#case_notes_view").scope().initVar();
                        loadingService.hide();
                        $ionicHistory.goBack();
                    } else {
                        errorHandler.handleOthers(status);
                    }
                });
        }
    }
}]);