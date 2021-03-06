app.service('barChartService', ['$rootScope', '$q', '$http', '$translate', function($rootScope,$q,$http,$translate) {
    var barChartExport;
    $rootScope.$on("LOGOUT", function(){
        barChartExport = null;
    });

    return {
        getOverviewChartData : function(data_array) {
            var chart_array = _.pluck(data_array, 'amt').reverse();
            var label_array = [];
            angular.forEach(_.pluck(data_array,'label').reverse(), function(title,index){
                label_array.push($translate.instant(title));
            });

            var ChartData = {
                labels: label_array,
                datasets: [{
                    fillColor: "rgba(192,188,188,1)",
                    data: chart_array,
                }]
            };

            return ChartData;
        },
        getProtectionsChartData : function(data_array) {
            var label_array = [];
            angular.forEach(_.pluck(data_array,'label').reverse(), function(title,index){
                label_array.push($translate.instant(title));
            });


            var ChartData = {
                labels: label_array,
                datasets: [
                    {
                        fillColor: suggested_color,
                        data: _.pluck(data_array,'suggested').reverse(),
                        title: "Suggested"
                    },
                    {
                        fillColor: current_color,
                        data: _.pluck(data_array,'amt').reverse(),
                        title: "Current"
                    },
                    {
                        fillColor: shortfall_color,
                        data: _.pluck(data_array,'diff').reverse(),
                        title: "Shortfall"
                    }
                ]
            };

            return ChartData;
        },
        getChartOptions : function(options_obj) {
            var chart_options = {};
            for (var key in bar_chart_options_g) {
                chart_options[key] = bar_chart_options_g[key];
            }
            for (var key in options_obj) {
                chart_options[key] = options_obj[key]
            }
            return chart_options;
        },
        drawChart : function(chart_id,chartData,chartOptions) {
            var ctx = document.getElementById(chart_id).getContext("2d");
            var barChart = new Chart(ctx).HorizontalBar(chartData,chartOptions);
            ctx.stroke();
        },
        drawChartExport : function(chart_id,chartData,chartOptions) {
            var ctx = document.getElementById(chart_id).getContext("2d");
            var barChart = new Chart(ctx).HorizontalBar(chartData,chartOptions);
            ctx.stroke();

            //var ctx = document.getElementById(chart_id).getContext("2d");
            //var barChartExport = undefined;
            //if (!validity_test(barChartExport)) barChartExport = new Chart(ctx);
            //barChartExport.HorizontalBar(chartData,chartOptions);
            //ctx.stroke();
        }
    }
}]);