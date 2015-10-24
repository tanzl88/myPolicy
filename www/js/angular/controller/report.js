app.controller('ReportCtrl', function($scope,$translate,$timeout,$interval,$state,$translate,$toast,$ionicScrollDelegate,modalService,
                                      loadingService,policyDataService,barChartService,doughnutChartService,credentialManager) {

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
                    if (index > 1) {
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
            console.log($scope.viewObj.cat);
            drawDoughnuts();
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
    $scope.showSuggestTooltip = function(title) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Tooltip', 'Suggested explanation');

        $scope.category          = $translate.instant("REPORT_" + title);
        $scope.suggestedCoverage = $translate.instant("REPORT_" + title + "_SUGG");
        $scope.suggestTooltip.show();
    };
    modalService.init("suggestTooltip","suggestTooltip",$scope).then(function(modal){
        $scope.suggestTooltip = modal;
    });
});

