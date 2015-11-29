app.controller('ReportTypeCtrl', function($scope,$rootScope,$state,$toast,$translate,reportTypeService,modalService,loadingService) {
    function hideEverything() {
        loadingService.hide();

        $scope.removeModal.hide();
    };

    $scope.initVar = function() {
        $scope.reportType = reportTypeService.getReportTypes();
    };

    $scope.editReportType = function(index) {
        if ($scope.reportType[index].type === "default") {
            $toast.show("DEFAULT_REPORT_TYPE");
        } else {
            $rootScope.reportType = $scope.reportType[index];
            $state.go("tabs.home.settings.reportType.editReportType");
        }
    };
    $scope.addReportType = function() {
        $state.go("tabs.home.settings.reportType.editReportType");
    };

    // ------- REMOVE -------
    $scope.remove = function(index) {
        if ($scope.reportType[index].type === "default") {
            $toast.show("DEFAULT_REPORT_TYPE");
        } else {
            $scope.removeModal.show();
            $scope.removeIndex = index;
        }
    };
    $scope.confirmRemove = function() {
        var removeIndex = $scope.removeIndex;
        delete $scope.removeIndex;
        reportTypeService.delete($scope.reportType[removeIndex].id).then(function(result){
            if ($("#report_list_view").length > 0) $("#report_list_view").scope().initModalVar();
            $scope.initVar();
            hideEverything();
        });
    };

    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("PDF_REMOVE_MSG");
});

app.controller('EditReportTypeCtrl', function($scope,$rootScope,$ionicHistory,reportTypeService,modalService,utilityService,$translate,$toast,loadingService) {
    function hideEverything() {
        loadingService.hide();

        $scope.reportTypeModal.hide();
    };

    $scope.pages = [
        {
            name    : "Cover",
            value   : "cover"
        },
        {
            name    : $translate.instant("COVERAGE_BREAKDOWN"),
            value   : "overview"
        },
        {
            name    : $translate.instant("KEY_PROTECTION_TITLE"),
            value   : "keyProtections"
        },
        {
            name    : $translate.instant("COVERAGE_TREND"),
            value   : "protectionsTrend"
        },
        {
            name    : $translate.instant("KEY_NEEDS_SUMMARY_POLICIES_ANALYSIS"),
            value   : "policiesAnalysis"
        },
        {
            name    : $translate.instant("NET_WORTH_ANALYSIS"),
            value   : "netWorth"
        },
        {
            name    : $translate.instant("POLICY_TABLES"),
            value   : "fullTable"
        },
        {
            name    : $translate.instant("KEY_PROTECTION_NEEDS_EXPLAINED"),
            value   : "needs"
        },
        {
            name    : $translate.instant("DISCLAIMER"),
            value   : "disclaimer"
        }
    ];

    $scope.initVar = function() {
        //IF PAGES FOUND -> EDIT, ELSE NEW
        if ($rootScope.reportType !== undefined) {
            $scope.mode = "EDIT";
            $scope.reportType = $rootScope.reportType;
            delete $rootScope.reportType;

            utilityService.resetForm("reportTypeForm",{
                reportName : $scope.reportType.name
            });
            angular.forEach($scope.pages,function(page,index){
                //IF FOUND IN PAGES ARRAY -> TRUE
                page.checked = $scope.reportType.pages.indexOf(page.value) >= 0 ? true : false;
            });
        } else {
            $scope.mode = "NEW";
            $scope.reportType = {};
            utilityService.resetForm("reportTypeForm",{
                reportName : undefined
            });
            angular.forEach($scope.pages,function(page,index){
                //IF FOUND IN PAGES ARRAY -> TRUE
                page.checked = false;
            });
        }
    };



    $scope.submit = function(form) {
        if (form.$invalid) {
            form.reportName.$setDirty();
        } else {
            var newReportName = form.reportName.$modelValue;
            //var existingReportName = _.pluck(reportTypeService.getReportTypes(),"name");
            //IF NAME EXIST -> TOAST, ELSE SUBMIT
            //if (existingReportName.indexOf(newReportName) >= 0) {
            //    $toast.show("DUPLICATE_NAME_FOUND");
            //} else {
                loadingService.show("SUBMITTING");

                var reportPages = [];
                angular.forEach($scope.pages, function(page,index){
                    if (page.checked) reportPages.push(page.value);
                });
                var input = {
                    id          : $scope.reportType.id,
                    reportName  : newReportName,
                    pages       : reportPages
                };
                reportTypeService.setReportType(input).then(function(result){
                    if (result === "OK") {
                        hideEverything();
                        if ($("#report_type_view").length > 0) $("#report_type_view").scope().initVar();
                        if ($("#report_list_view").length > 0) $("#report_list_view").scope().initModalVar();
                        $ionicHistory.goBack();
                    } else {
                        loadingService.hide();
                    }
                });
            //}
        }
    };

    // ------------- MODAL -------------
    modalService.init("report_type","report_type",$scope).then(function(modal){
        $scope.reportTypeModal = modal;
    });
    $scope.hideReportTypeModal = function() {
        modalService.close("report_type");
    };
});

