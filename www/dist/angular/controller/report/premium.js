app.controller('PremiumCtrl', ['$scope', '$translate', '$timeout', '$interval', '$toast', '$state', '$ionicScrollDelegate', 'credentialManager', 'policyDataService', 'policyDataDbService', 'personalDataDbService', 'barChartService', 'lineChartService', 'doughnutChartService', function($scope,$translate,$timeout,$interval,$toast,$state,$ionicScrollDelegate,credentialManager,
                                        policyDataService,policyDataDbService,personalDataDbService,barChartService,lineChartService,doughnutChartService) {
    //---------------------- LINE CHART ----------------------------------
    function drawLineChart(chartData,chartOptions) {
        var initTimer;
        initTimer = $interval(function() {
            var ele_to_check = $("#premiumTrendChart");
            if (ele_to_check.length > 0) {
                //STYLING
                var chart_width = Math.floor(window_width_g) - 16;
                var chart_height = Math.floor(window_height_g * 0.5);
                $(ele_to_check).attr("width", chart_width).attr("height", chart_height);
                lineChartService.drawChart("premiumTrendChart", chartData, chartOptions);
                $interval.cancel(initTimer);
            }
        },100);
    }
    //---------------------- DOUGHNUT CHART ----------------------------------
    function drawPie(chartData,chartOptions) {
        var initTimer;
        initTimer = $interval(function(){
            var ele_to_check = $("#premium_ratio_pie");
            if (ele_to_check.length > 0) {
                //STYLING
                var chart_width = Math.floor(window_width_g * 0.7);
                $(".doughnut_container").width(chart_width).height(chart_width);
                $(ele_to_check).attr("width",chart_width).attr("height",chart_width);
                doughnutChartService.drawPie("premium_ratio_pie", chartData, chartOptions);
                $interval.cancel(initTimer);
            }
        },100);
    };
    function getPremiumRatioData(premiumData) {
        console.log(premiumData);
        var data = [
            {
                value   : premiumData.protection,
                color   : "#FED82F",
                title   : "Protections"
            },
            {
                value   : premiumData.savings,
                color   : "rgba(139,188,230,1)",
                title   : "Savings",
            },
            {
                value   : premiumData.income - premiumData.protection - premiumData.savings,
                color   : "rgba(130,124,111,1)",
                title   : "Others"
            }
        ];
        return data;
    };

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
            //$scope.viewObj = {};
            //$scope.viewObj.cat = policyDataService.getPremiumData();
            $scope.premiumObj       = policyDataService.getPremiumData();
            $scope.premiumRatioData =  getPremiumRatioData($scope.premiumObj);
            var chartOptions = doughnutChartService.getChartOptions({

            });
            drawPie($scope.premiumRatioData,chartOptions);


            //CHECK BIRTHDAY BEFORE DRAW LINE LINE CHART
            $scope.birthdayAvailable = personalDataDbService.getUserData("birthday") === undefined ? false : true;

            //DRAW LINE CHART
            if ($scope.birthdayAvailable) {
                var premiumTrendData = policyDataDbService.getPremiumTrend();
                var premiumChartData = lineChartService.getPremiumTrendChartData(premiumTrendData);
                if ($("html").hasClass("tablet")) {
                    var chartOptions = lineChartService.getChartOptions({
                        scaleFontSize           : 18,
                        xAxisFontSize           : 18,
                        //barValueSpacing         : Math.floor(chart_width/4000 * 110),
                        //xAxisSpaceBefore        : Math.floor(chart_width/4000 * 50),
                        //xAxisLabelSpaceBefore   : Math.floor(chart_width/4000 * 100),
                        //yAxisSpaceLeft          : Math.floor(chart_width/4000 * 100),
                        //scaleLineWidth          : Math.floor(chart_width/4000 * 10),
                    });
                } else {
                    var chartOptions = lineChartService.getChartOptions({

                    });
                }

                drawLineChart(premiumChartData,chartOptions);
            }
        }
    };
}]);

