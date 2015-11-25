app.controller('OverviewCtrl', function($scope,$translate,$timeout,$interval,$toast,$state,$ionicScrollDelegate,credentialManager,
                                        policyDataService,policyDataDbService,personalDataDbService,barChartService,lineChartService) {

    function drawBarChart(canvasId,heightFactor,chartData,chartOptions) {
        var initTimer;
        initTimer = $interval(function() {
            var ele = canvasId;
            var ele_to_check = $("#" + ele);
            if (ele_to_check.length > 0) {
                //STYLING
                var chart_width = Math.floor(window_width_g - 16);
                var chart_height = Math.floor(window_height_g * heightFactor);
                $(ele_to_check).attr("width", chart_width).attr("height", chart_height);
                barChartService.drawChart(ele, chartData, chartOptions);
                $interval.cancel(initTimer);
            }
        },100);
    }

    //function drawIncomeBarChart(chartData,chartOptions) {
    //    var initTimer;
    //    initTimer = $interval(function() {
    //        var ele = "overviewIncomeChart";
    //        var ele_to_check = $("#" + ele);
    //        if (ele_to_check.length > 0) {
    //            //STYLING
    //            var chart_width = Math.floor(window_width_g - 16);
    //            var chart_height = Math.floor(window_height_g * 0.65);
    //            $(ele_to_check).attr("width", chart_width).attr("height", chart_height);
    //            barChartService.drawChart(ele, chartData, chartOptions);
    //            $interval.cancel(initTimer);
    //        }
    //    },100);
    //}

    $scope.goToProfile = function() {
        $state.go("tabs.profile");
    };

    $scope.initVar = function() {
        console.log("OVERVIEW INIT VAR");
        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('overview').scrollTop();

        //CHECK CLIENT SELECTED
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();

        if (($scope.credential === "advisor" && $scope.clientSelected) || $scope.credential === "client") {
            $scope.currency = $translate.instant("CURRENCY");
            $scope.viewObj = {};
            $scope.viewObj.cat = _.groupBy(policyDataService.getOverviewData(),function(cat){ return cat.chart; });

            //DRAW BAR CHART

            if ($("html").hasClass("tablet")) {
                var chartOptions = barChartService.getChartOptions({
                    scaleFontSize           : 18,
                    xAxisFontSize           : 18,
                });
                var overviewHeightFactor = 0.8;
                var overviewIncomeHeightFactor = 0.55;
            } else {
                var chartOptions = barChartService.getChartOptions({

                });
                var overviewHeightFactor = 0.65;
                var overviewIncomeHeightFactor = 0.43;
            }
            var chartData = barChartService.getOverviewChartData($scope.viewObj.cat.lump);
            drawBarChart("overviewChart",overviewHeightFactor,chartData,chartOptions);

            var chartData = barChartService.getOverviewChartData($scope.viewObj.cat.income);
            drawBarChart("overviewIncomeChart",overviewIncomeHeightFactor,chartData,chartOptions);
        }
    };
});

