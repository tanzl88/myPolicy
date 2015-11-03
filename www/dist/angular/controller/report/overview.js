app.controller('OverviewCtrl', ['$scope', '$translate', '$timeout', '$interval', '$toast', '$state', '$ionicScrollDelegate', 'credentialManager', 'policyDataService', 'policyDataDbService', 'personalDataDbService', 'barChartService', 'lineChartService', function($scope,$translate,$timeout,$interval,$toast,$state,$ionicScrollDelegate,credentialManager,
                                        policyDataService,policyDataDbService,personalDataDbService,barChartService,lineChartService) {

    function drawBarChart(chartData,chartOptions) {
        var initTimer;
        initTimer = $interval(function() {
            var ele_to_check = $("#overviewChart");
            if (ele_to_check.length > 0) {
                //STYLING
                var chart_width = Math.floor(window_width_g - 16);
                var chart_height = Math.floor(window_height_g * 0.65);
                $("#overviewChart").attr("width", chart_width).attr("height", chart_height);
                barChartService.drawChart("overviewChart", chartData, chartOptions);
                $interval.cancel(initTimer);
            }
        },100);
    }

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
            $scope.viewObj.cat = policyDataService.getOverviewData();

            //DRAW BAR CHART
            var chartData = barChartService.getOverviewChartData($scope.viewObj.cat);
            if ($("html").hasClass("tablet")) {
                var chartOptions = barChartService.getChartOptions({
                    scaleFontSize           : 18,
                    xAxisFontSize           : 18,
                    //barValueSpacing         : Math.floor(chart_width/4000 * 110),
                    //xAxisSpaceBefore        : Math.floor(chart_width/4000 * 50),
                    //xAxisLabelSpaceBefore   : Math.floor(chart_width/4000 * 100),
                    //yAxisSpaceLeft          : Math.floor(chart_width/4000 * 100),
                    //scaleLineWidth          : Math.floor(chart_width/4000 * 10),
                });
            } else {
                var chartOptions = barChartService.getChartOptions({

                });
            }

            drawBarChart(chartData,chartOptions);
        }
    };
}]);

