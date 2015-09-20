app.controller('OverviewCtrl', function($scope,$translate,$timeout,$interval,$toast,$ionicScrollDelegate,credentialManager,policyDataService,barChartService) {

    function drawChart(chartData,chartOptions) {
        var initTimer;
        initTimer = $interval(function() {
            var ele_to_check = $("#overviewChart");
            if (ele_to_check.length > 0) {
                //STYLING
                var chart_width = Math.floor(window_width_g);
                var chart_height = Math.floor(window_height_g * 0.65);
                $("#overviewChart").attr("width", chart_width).attr("height", chart_height);
                barChartService.drawChart("overviewChart", chartData, chartOptions);
                $interval.cancel(initTimer);
            }
        },100);
    }

    $scope.initVar = function() {
        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('overview').scrollTop();

        //CHECK CLIENT SELECTED
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();

        if (($scope.credential === "advisor" && $scope.clientSelected) || $scope.credential === "client") {
            $scope.currency = $translate.instant("CURRENCY");
            $scope.viewObj = {};
            $scope.viewObj.cat = policyDataService.getOverviewData();
            var chartData = barChartService.getOverviewChartData($scope.viewObj.cat);
            var chartOptions = barChartService.getChartOptions({

            });
            drawChart(chartData,chartOptions);
        }
    }
});

