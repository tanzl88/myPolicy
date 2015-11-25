app.service('exportUtility', ['$q', '$http', '$interval', '$translate', 'barChartService', 'doughnutChartService', 'lineChartService', function($q,$http,$interval,$translate,barChartService,doughnutChartService,lineChartService) {
    //STYLING
    var marginLeft = 40;
    var marginTop = 45;
    var doc_width = 845;
    var doc_height = 598;
    //var ele_width = doc_height - (marginTop * 2);

    return {
        getImageDataUrl : function(src,width,height) {
            var dfd = $q.defer();
            var canvas_width = width;
            var canvas_height = height;

            var imageObj = new Image();
            imageObj.onload = function() {
                if (!validity_test(canvas_height)) {
                    var ratio       = canvas_width / this.width;
                    canvas_height   = ratio * this.height;
                }
                if (!validity_test(canvas_width)) {
                    var ratio       = canvas_height / this.height;
                    canvas_width    = ratio * this.width;
                }

                //CREATE CANVAS
                var canvas = document.createElement("canvas");
                $(canvas).attr("width",canvas_width).attr("height",canvas_height);
                var context = canvas.getContext('2d');
                context.drawImage(imageObj,0,0,canvas_width,canvas_height);

                //LAY WHITE BACKGROUND UNDERNEATH
                var backgroundColor = "rgb(255,255,255)";
                context.globalCompositeOperation = "destination-over";
                context.fillStyle = backgroundColor;
                context.fillRect(0,0,canvas_width,canvas_height);

                dfd.resolve({
                    dataUrl : canvas.toDataURL("image/jpeg",0.7),
                    ratio : canvas_width / canvas_height
                });
            };
            imageObj.src = src;
            return dfd.promise;
        },
        drawChart : function(chartId,chartData,chartOptions,width,height) {
            var initTimer;
            initTimer = $interval(function() {
                var ele_to_check = $("#" + chartId);
                if (ele_to_check.length > 0) {
                    //STYLING
                    var chart_width = Math.floor(width);
                    var chart_height = Math.floor(height);

                    $("#" + chartId).attr("width", chart_width).attr("height", chart_height);
                    barChartService.drawChartExport(chartId, chartData, chartOptions);

                    $interval.cancel(initTimer);
                }
            });
        },
        drawLineChart : function(chartId,chartData,chartOptions,width,height) {
            var initTimer;
            initTimer = $interval(function() {
                var ele_to_check = $("#" + chartId);
                if (ele_to_check.length > 0) {
                    //STYLING
                    var chart_width = Math.floor(width);
                    var chart_height = Math.floor(height);

                    $("#" + chartId).attr("width", chart_width).attr("height", chart_height);
                    lineChartService.drawChart(chartId, chartData, chartOptions);

                    $interval.cancel(initTimer);
                }
            },1);
        },
        drawDoughnutChart2 : function(cat,index,doughnutChartOptions) {
            var initTimer;
            var chartId = "doughnut-export" + index
            initTimer = $interval(function(){
                var ele_to_check = $("#" + chartId);
                if (ele_to_check.length > 0) {
                    //STYLING
                    var chart_width = 1000;
                    $("#" + chartId).attr("width", chart_width).attr("height", chart_width);

                    //POST PROCESS FOR EMTPY DATA -> DRAW ALL SHORTFALL
                    if (cat.chartData[0].value === "" && cat.chartData[1].value === 0) {
                        cat.chartData[1].value = 1;
                    }
                    var chart = doughnutChartService.drawChart(chartId, cat.chartData, doughnutChartOptions);
                    $interval.cancel(initTimer);
                }
            },1);
        },
        drawDoughnutChart : function(catObj,doughnutChartOptions) {
            var initTimer;
            initTimer = $interval(function(){
                var ele_to_check = $(".doughnutChart-export");
                if (ele_to_check.length > 0) {
                    //STYLING
                    var chart_width = 2500;
                    $(".doughnutChart-export").attr("width",chart_width).attr("height",chart_width);

                    angular.forEach(catObj,function(cat,index){
                        //POST PROCESS FOR EMTPY DATA -> DRAW ALL SHORTFALL
                        if (cat.chartData[0].value === 0 && cat.chartData[1].value === 0) {
                            cat.chartData[1].value = 1;
                        }
                        doughnutChartService.drawChart("doughnut-export" + index, cat.chartData, doughnutChartOptions);
                    });
                    $interval.cancel(initTimer);
                }
            },100);
        },
        drawDoughnutChart : function(catObj,doughnutChartOptions) {
            var initTimer;
            initTimer = $interval(function(){
                var ele_to_check = $(".doughnutChart-export");
                if (ele_to_check.length > 0) {
                    //STYLING
                    var chart_width = 2500;
                    $(".doughnutChart-export").attr("width",chart_width).attr("height",chart_width);

                    angular.forEach(catObj,function(cat,index){
                        //POST PROCESS FOR EMTPY DATA -> DRAW ALL SHORTFALL
                        if (cat.chartData[0].value === 0 && cat.chartData[1].value === 0) {
                            cat.chartData[1].value = 1;
                        }
                        doughnutChartService.drawChart("doughnut-export" + index, cat.chartData, doughnutChartOptions);
                    });
                    $interval.cancel(initTimer);
                }
            },100);
        },
        drawPieChart : function(chartData,chartOptions) {
            var initTimer;
            initTimer = $interval(function(){
                var chartId = "premiumRatioPie-export";
                var ele_to_check = $("#" + chartId);
                if (ele_to_check.length > 0) {
                    //STYLING
                    var chart_width = 1000;
                    $(ele_to_check).attr("width",chart_width).attr("height",chart_width);
                    doughnutChartService.drawPie(chartId, chartData, chartOptions);
                    $interval.cancel(initTimer);
                }
            },100);
        },
        setRenderFont : function(doc,fontSize,fontStyle,color) {
            fontStyle = fontStyle === undefined ? "regular" : fontStyle;
            color     = color     === undefined ? [0,0,0]   : color;
            doc.setFontType(fontStyle);
            doc.setFont("Helvetica");
            doc.setFontSize(fontSize);
            doc.setTextColor(color[0],color[1],color[2]);

        },
        renderHeading : function(doc,title) {
            //OVERVIEW TITLE BACKGROUND COLOR
            doc.setFillColor(254,216,47);
            doc.rect(0, 0, doc_width, marginTop * 1.1, 'F');

            //OVERVIEW TITLE
            this.setRenderFont(doc,16,"bold");
            doc.text(marginLeft, marginTop / 2 + 8, title);
        },
        drawChartImage : function(doc,chartId,left,top,width,height) {
            var chartEle = document.getElementById(chartId);
            var chart = chartEle.toDataURL("image/jpeg",0.7);
            var chartRatio = $(chartEle).attr("width") / $(chartEle).attr("height");

            if (width === null) {
                width = height * chartRatio;
            }
            if (height === null) {
                height = width / chartRatio;
            }

            doc.addImage(chart, 'JPEG', left, top, width, height);
            $(chartEle).remove();
        }
    }
}]);