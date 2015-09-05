app.service('doughnutChartService', function($q,$http,$translate) {


    return {
        getChartOptions : function(options_obj) {
            var chart_options = {};
            for (var key in doughnut_chart_options_g) {
                chart_options[key] = doughnut_chart_options_g[key];
            }
            for (var key in options_obj) {
                chart_options[key] = options_obj[key]
            }
            return chart_options;
        },
        drawChart : function(chart_id,chartData,chartOptions) {
            var ctx = document.getElementById(chart_id).getContext("2d");
            var chart = new Chart(ctx).Doughnut(chartData,chartOptions);
            ctx.stroke();
        }
    }
});