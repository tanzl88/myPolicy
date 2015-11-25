app.service('lineChartService', ['$rootScope', '$q', '$http', '$translate', '$filter', function($rootScope,$q,$http,$translate,$filter) {
    var lineChartExport;
    $rootScope.$on("LOGOUT", function(){
        lineChartExport = null;
    });

    return {
        getPremiumTrendChartData : function(data_array) {
            var labels = [];
            angular.forEach(data_array.data, function(data,index){
                if (parseInt(data.age) % 10 === 0 && data.type !== "now") labels.push(data.age);
            });

            var ChartData = {
                labels: labels,
                datasets: [
                    {
                        fillColor               : "rgba(220,220,220,0.2)",
                        strokeColor             : "rgba(255,216,47,1)",
                        pointColor              : "rgba(150,150,150,1)",
                        pointStrokeColor        : "#fff",
                        pointHighlightFill      : "#fff",
                        pointHighlightStroke    : "rgba(220,220,220,1)",
                        xPos                    : _.pluck(data_array.data,'age'),
                        data                    : _.pluck(data_array.data,'premium'),
                        title                   : "Premium"
                    }
                ]
            };

            if (data_array.now.index !== undefined) {
                ChartData.datasets.push({
                    //fillColor               : "rgba(220,220,220,0.2)",
                    //strokeColor             : "rgba(255,216,47,1)",
                    pointColor              : "rgba(227,113,93,1)",
                    pointStrokeColor        : "#fff",
                    pointHighlightFill      : "#fff",
                    pointHighlightStroke    : "rgba(220,220,220,1)",
                    data                    : [data_array.now.premium],
                    xPos                    : [data_array.now.age],
                    title                   : "Premium"
                });
                ChartData.shapesInChart = [
                    {
                        position : "RELATIVE",
                        shape: "TEXT",
                        text : "Current premium:\n" + $filter("currency")(data_array.now.premium,"S$",0),
                        textAlign : "center",
                        textBaseline : "top",
                        fontStyle : "normal",
                        fontFamily : "'Helvetica'",
                        fontColor : "black",
                        fontSize : 12,
                        iter: "last",
                        animate : false,
                        x1: data_array.now.index,
                        y1 : 0,
                        //paddingX1 : 0,
                        paddingY1 : 15
                    },
                    {
                        position : "INCHART",
                        shape: "ARROW",
                        iter: "last",
                        strokeSize: 3,
                        strokeColor: 'black',
                        animate : false,
                        x1: data_array.now.index,
                        y1 : 99999999999999,
                        x2: data_array.now.index,
                        y2 : data_array.now.premium,
                        arrowWidth: 10,
                        arrowHeight: 7,
                        //paddingX1 : 0,
                        paddingY2 : -5
                    }
                ];
            }

            return ChartData;
        },
        getChartOptions : function(options_obj) {
            var chart_options = {};
            for (var key in line_chart_options_g) {
                chart_options[key] = line_chart_options_g[key];
            }
            for (var key in options_obj) {
                chart_options[key] = options_obj[key]
            }
            return chart_options;
        },
        drawChart : function(chart_id,chartData,chartOptions) {
            var ctx = document.getElementById(chart_id).getContext("2d");
            var now = Date.now();
            var lineChart = new Chart(ctx).Line(chartData,chartOptions);
            //var lineChart = new Chart(ctx, {
            //    type: 'line',
            //    data: chartData,
            //    options: chartOptions
            //});
        },
        getCoverageTrendChartData : function(data_array) {
            var labels = [];
            angular.forEach(_.pluck(data_array.data,'age'), function(age,index){
                if (index % 2 === 0) labels.push(age);
            });
            var ChartData = {
                labels: labels,
                datasets: [{
                    fillColor               : "rgba(220,220,220,0.2)",
                    strokeColor             : "rgba(255,216,47,1)",
                    pointColor              : "rgba(150,150,150,1)",
                    pointStrokeColor        : "#fff",
                    pointHighlightFill      : "#fff",
                    pointHighlightStroke    : "rgba(220,220,220,1)",
                    xPos                    : _.pluck(data_array.data,'age'),
                    data                    : _.pluck(data_array.data,'coverage'),
                    title                   : "Coverage"
                }]
            };
            return ChartData;
        },
        getAllCoverageTrendChartData : function(data_array) {
            var shapes = [
                "square",
                "diamond",
                "circle",
                "square",
                "diamond",
                "circle",
                "square",
                "diamond",
                "circle",
            ];
            var colors = [
                "rgba(255,216,47,1)",
                "rgba(255,0,0,1)",
                "rgba(0,255,0,1)",
                "rgba(0,0,255,1)",
                "rgba(255,255,0,1)",
                "rgba(0,255,255,1)",
                "rgba(255,0,255,1)"
            ]
            var labels = [];
            angular.forEach(_.pluck(data_array.data[0],'age'), function(age,index){
                if (index % 2 === 0) labels.push(age);
            });
            var ChartData = {
                labels: labels,
                datasets: []
            };
            angular.forEach(data_array.data, function(cat,index){
               ChartData.datasets.push({
                   fillColor               : "rgba(220,220,220,0)",
                   strokeColor             : colors[index],
                   pointColor              : "rgba(150,150,150,1)",
                   pointStrokeColor        : "#fff",
                   pointHighlightFill      : "#fff",
                   pointHighlightStroke    : "rgba(220,220,220,1)",
                   xPos                    : _.pluck(cat,'age'),
                   data                    : _.pluck(cat,'coverage'),
                   markerShape             : shapes[index],
                   title                   : "Coverage",
               });
            });
            return ChartData;
        },
    }
}]);