app.controller('ReportCtrl', function($scope,$translate,$timeout,$interval,$state,$translate,$toast,$ionicScrollDelegate,modalService,
                                      loadingService,personalDataDbService,policyDataService,policyDataDbService,barChartService,doughnutChartService,lineChartService,credentialManager) {

    //---------------------- DOUGHNUT CHART ----------------------------------
    function drawDoughnuts() {
        var initTimer;
        initTimer = $interval(function(){
            var ele_to_check = $(".doughnut_container canvas");
            if (ele_to_check.length > 0) {
                //STYLING
                var chart_width = Math.floor(window_width_g * 0.7);
                $(".doughnut_container").width(chart_width).height(chart_width);
                $(".doughnut_container canvas").attr("width",chart_width).attr("height",chart_width);
                angular.forEach($scope.viewObj.cat,function(cat,index){
                    if (index > -1) {
                        chartOptions.animation = false;
                    }
                    //POST PROCESS FOR EMTPY DATA -> DRAW ALL SHORTFALL
                    if (cat.chartData[0].value === "" && cat.chartData[1].value === 0) {
                        cat.chartData[1].value = 0;
                        cat.chartData[1].value = 1;
                    }
                    doughnutChartService.drawChart("doughnut-" + index, cat.chartData, chartOptions);
                });
                $interval.cancel(initTimer);
            }
        },100);
    };
    $scope.chooseLineChart = function(index) {
        $scope.chosenCat = index;
        $scope.cat = $scope.viewObj.cat[index];
        var chosenCoverageTrendData = angular.copy($scope.coverageTrendData);
        chosenCoverageTrendData.data = chosenCoverageTrendData.data[index];
        var coverageChartData = lineChartService.getCoverageTrendChartData(chosenCoverageTrendData);

        if ($("html").hasClass("tablet")) {
            var chartOptions = lineChartService.getChartOptions({
                scaleFontSize           : 18,
                xAxisFontSize           : 18,
            });
        } else {
            var chartOptions = lineChartService.getChartOptions({
                spaceTop    : 18
            });
        }
        //$ionicScrollDelegate.$getByHandle('report').scrollBy(0,$("#reportLineChart").offset().top,true);
        drawLineChart(coverageChartData,chartOptions);
    };
    function drawLineChart(chartData,chartOptions) {
        var initTimer;
        initTimer = $interval(function() {
            var ele_to_check = $("#coverageTrendChart");
            if (ele_to_check.length > 0) {
                //STYLING
                var chart_width = Math.floor(window_width_g) - 16;
                var chart_height = Math.floor(window_height_g * 0.5);
                $("#coverageTrendChart").attr("width", chart_width).attr("height", chart_height);
                console.log(chartData);
                lineChartService.drawChart("coverageTrendChart", chartData, chartOptions);
                $interval.cancel(initTimer);
            }
        },100);
    };
    var chartOptions = doughnutChartService.getChartOptions({

    });

    $scope.reCalculate = function(index,value) {
        $scope.viewObj.cat = policyDataService.updateSuggestedFigure(index,value);
        drawDoughnuts();
    };
    $scope.restoreDefault = function(index) {
        $scope.viewObj.cat = policyDataService.removeSuggestedFigure(index);
        drawDoughnuts();
    };

    //________________________________________________________________________________
    $scope.goToProfile = function() {
        $state.go("tabs.profile");
    };
    $scope.initVar = function() {
        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('report').scrollTop();

        //CHECK CLIENT SELECTED
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();

        if (($scope.credential === "advisor" && $scope.clientSelected) || $scope.credential === "client") {
            $scope.currency = $translate.instant("CURRENCY").trim();
            $scope.viewObj = {};
            $scope.viewObj.cat = policyDataService.getProtectionsData();
            drawDoughnuts();

            $scope.birthdayAvailable = personalDataDbService.getUserData("birthday") === undefined ? false : true;
            if ($scope.birthdayAvailable) {
                $scope.coverageTrendData = policyDataDbService.getCoverageTrend();
                $scope.chooseLineChart(6);
            }
        }
    };

    //TOOLTIP
    $scope.showDoughnutTooltip = function(title) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Tooltip', 'Protection explanation');

        $scope.category          = $translate.instant("REPORT_" + title);
        $scope.importanceContent = $translate.instant("REPORT_" + title + "_IMPT");
        $scope.coverageContent   = $translate.instant("REPORT_" + title + "_DESC");
        $scope.doughnutTooltip.show();
    };
    modalService.init("doughnutTooltip","doughnutTooltip",$scope).then(function(modal){
        $scope.doughnutTooltip = modal;
    });
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    $scope.showSuggestTooltip = function(title) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Tooltip', 'Suggested explanation');
        var useAdvanced = personalDataDbService.getUserData("useAdvanced") == 1 ? "_ADV" : "";

        $scope.category          = $translate.instant("REPORT_" + title);
        var suggestedString      = $translate.instant("REPORT_" + title + "_SUGG" + useAdvanced);

        $scope.suggestedCoverage = capitalizeFirstLetter((suggestedString.split("Suggested coverage is "))[1]);
        $scope.suggestTooltip.show();
    };
    modalService.init("suggestTooltip","suggestTooltip",$scope).then(function(modal){
        $scope.suggestTooltip = modal;
    });
});

