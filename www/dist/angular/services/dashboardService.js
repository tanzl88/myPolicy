app.service('dashboardService', ['$q', '$http', '$interval', 'doughnutChartService', function($q,$http,$interval,doughnutChartService) {

    function getChartOptions(options) {
        var chartOptions = {
            percentageInnerCutout: 60,
            spaceTop: 1,
            spaceBottom: 1,
            spaceLeft: 1,
            spaceRight: 1,
            animation : animateDashboard,
            animationSteps: 50,
            annotateDisplay: false
        };
        chartOptions.extend(options);
        return chartOptions;
    }

    return {
        drawMeter : function(ele) {
            var chartOptions = getChartOptions({});
            doughnutChartService.drawChart(
                "client-doughnut",
                $scope.meterData.chartData,
                doughnutChartService.getChartOptions(chartOptions)
            );
        },
        animateInflate : function(DOM,scale) {
            TweenLite.to(DOM, 0.3, {
                scale       : scale,
                ease        : Power1.easeInOut,
                onComplete  : function() {
                    TweenLite.to(DOM, 0.2, {
                        scale       : 1,
                        ease        : Power1.easeInOut
                    });
                }
            });
        },
        animateInflatePercent : function(DOM,scale) {
            TweenLite.to(DOM, 0.3, {
                x           : -$(DOM).width() * 0.5,
                y           : -$(DOM).height() * 0.5,
                scale       : scale,
                ease        : Power1.easeInOut,
                onComplete  : function() {
                    TweenLite.to(DOM, 0.2, {
                        x           : -$(DOM).width() * 0.5,
                        y           : -$(DOM).height() * 0.5,
                        scale       : 1,
                        ease        : Power1.easeInOut
                    });
                }
            });
        }
    };
}]);