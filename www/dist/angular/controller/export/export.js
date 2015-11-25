app.controller('ExportCtrl', ['$scope', '$rootScope', '$q', '$translate', '$timeout', '$interval', '$ionicHistory', '$cordovaFile', '$toast', '$filter', '$translate', 'advisorDataDbService', 'personalDataDbService', 'policyDataDbService', 'reactDOMService', 'policyDataService', 'barChartService', 'lineChartService', 'doughnutChartService', 'picNotesService', 'loadingService', 'exportUtility', function($scope,$rootScope,$q,$translate,$timeout,$interval,$ionicHistory,$cordovaFile,$toast,$filter,$translate,
                                      advisorDataDbService,personalDataDbService,policyDataDbService,reactDOMService,
                                      policyDataService,barChartService,lineChartService,doughnutChartService,picNotesService,
                                      loadingService,exportUtility) {
    var exportStartTime = Date.now();
    var exportTime  = exportStartTime;
    var render = {};


    $scope.currency = $translate.instant("CURRENCY").trim();
    $scope.viewObj = {};
    $scope.viewObj.overviewData     = _.groupBy(policyDataService.getOverviewData(),function(cat){ return cat.chart; });
    angular.forEach($scope.viewObj.overviewData.lump,function(cat,index){
        cat.translate = $translate.instant(cat.label).replace(/\n/g," ");
    });
    angular.forEach($scope.viewObj.overviewData.income,function(cat,index){
        cat.translate = $translate.instant(cat.label).replace(/\n/g," ");
    });

    $scope.viewObj.cat  = policyDataService.getProtectionsData();
    $scope.viewObj.sums = policyDataDbService.getAllSum();
    $scope.personal     = angular.copy(personalDataDbService.getNetWorthData());
    $scope.fullTableObj = reactDOMService.getFullTable([full_table_g_1,full_table_g_2]);


    $scope.payoutObj    = policyDataDbService.getPayoutData();
    $scope.premiumObj   = policyDataService.getPremiumData();
    $scope.premiumBreakdownObj = policyDataDbService.getTotalPremium2();



    var ratio = 1.4142857143;

    //STYLING
    var marginLeft = 30;
    var marginLeftLess = 20;
    var marginTop = 45;
    var marginTopAdj = marginTop + 15;
    var doc_width = 845;
    var doc_height = 598;
    var ele_width = (doc_width - (marginTop * 2)) * 0.90;
    var ele_height = (doc_height - (marginTop * 2)) * 0.90;
    var doc, pages, page_index;
    var default_pages = [
        "cover",
        "overview",
        "keyProtections",
        "protectionsTrend",
        "policiesAnalysis",
        "netWorth",
        //"financialRatios",
        "fullTable",
        "needs",
        "disclaimer"
    ];

    $scope.initVar = function() {
        pages = default_pages;
        page_index = -1;
        $timeout(function(){
            if (validity_test($rootScope.reportName)) {
                $scope.reportName = $rootScope.reportName;
                delete $rootScope.reportName;
                doc = new jsPDF('l','pt','a4');
                doc.setOverflowHook(undefined);
                nextPage();
            } else {
                reportComplete(false);
            }
        },100);
    };

    function nextPage() {
        page_index += 1;

        if (page_index === 0) {
            console.log("REPORT RENDERING STARTED");
        } else {

        }

        console.log("TOOK: " + (Date.now() - exportTime) + " ms.");
        exportTime = Date.now();

        if (page_index >= pages.length) {
            save();
        } else {
            var page_name = pages[page_index];
            console.log("RENDERING: " + page_name + "......");
            try {
                render[page_name]();
            } catch(e) {
                console.log("ERROR FOUND WHEN GENERATING REPORT");
                $toast.show("GENERATE_REPORT_ERROR");
                reportComplete(false);
            }

        }
    }

    function reportComplete(refresh) {
        if (refresh) $("#report_list_view").scope().initVar();
        $ionicHistory.goBack();
        $timeout(function(){
            loadingService.hide();
            //ANALYTICS
            if (ionic.Platform.isWebView()) window.analytics.trackTiming('PROCESS', Date.now() - exportStartTime, 'Export', 'Generate reports');
        },400);
    }

    function save() {
        if (ionic.Platform.isWebView()) {
            $cordovaFile.writeFile(fileTransferDir, $scope.reportName, doc.output("blob"), true)
                .then(function (success) {
                    // success
                    console.log(success);
                    doc.destroy();
                    reportComplete(true);

                }, function (error) {
                    console.log(error);
                    doc.destroy();
                    $toast.show("GENERATE_REPORT_FAILED");
                    reportComplete(false);
                });
        } else {
            doc.save('sample-file.pdf');
            doc.destroy();
            //$ionicHistory.goBack();
            //$ionicHistory.goBack();
            loadingService.hide();
        }

        console.log("REPORT RENDERING COMPLETED");
        console.log("TOOK: " + (Date.now() - exportStartTime) + " ms.");
    }

    render.cover = function() {
        function renderPageOne(result) {
            //BACKGROUND
            doc.addImage(result[0].dataUrl, 'JPEG', 0, 0, doc_width, doc_width/result[0].ratio);

            //LOGO
            if (result[1] !== undefined) {
                var logoHeight = 80;
                var logoWidth  = logoHeight * result[1].ratio;
                doc.addImage(result[1].dataUrl, 'JPEG', doc_width - logoWidth - 20, 20, logoWidth, logoHeight);
            }

            //TITLE
            var clientName = personalDataDbService.getData().name;
            exportUtility.setRenderFont(doc,55,"bold",[64,64,64]);
            doc.text(doc_width / 6, doc_height * 0.42, $translate.instant("INSURANCE_PROPOSAL"));
            exportUtility.setRenderFont(doc,35,"bold",[64,64,64]);
            doc.text(doc_width / 6, doc_height * 0.42 + 45, 'for ' + clientName);
            exportUtility.setRenderFont(doc,30,"bold",[64,64,64]);
            doc.text(doc_width / 6, doc_height * 0.42 + 45 + 40, moment().format("LL"));

            //SIGNATURE
            exportUtility.setRenderFont(doc,13);
            var signature = "";
            var advisorData = advisorDataDbService.getData();
            if (advisorData.name)    signature   += advisorData.name + "\n";
            if (advisorData.title)   signature   += advisorData.title + "\n";
            if (advisorData.agency)  signature   += advisorData.agency + "\n";
            if (advisorData.company) signature   += advisorData.company + "\n";
            if (advisorData.repNo)   signature   += "Rep No: " + advisorData.repNo + "\n";
            if (advisorData.address) signature   += "Add: " + advisorData.address + "\n";
            if (advisorData.phone)   signature   += "Tel: " + advisorData.phone + "\n";
            if (advisorData.email)   signature   += "Email: " + advisorData.email + "\n";
            if (advisorData.website) signature   += "Website: " + advisorData.website;

            var signature = signature.trim();
            var numberOfLines = signature.split(/\r\n|\r|\n/).length;
            doc.text(doc_width - 20, doc_height - 13 * numberOfLines - 30, signature, "", 0, "right");

            nextPage();
        }


        //FIRST PAGE
        var documentPixelWidth = 2000;
        var promises = [];

        if (advisorDataDbService.getData().logo === true && ionic.Platform.isWebView()) {
            picNotesService.getLogo().then(function(logoUrl){
                promises.push(exportUtility.getImageDataUrl('img/proposal_cover.svg',documentPixelWidth,documentPixelWidth/ratio));
                promises.push(exportUtility.getImageDataUrl(logoUrl.src,null,500));
                $q.all(promises).then(function(result){
                    renderPageOne(result);
                });
            });
        } else {
            promises.push(exportUtility.getImageDataUrl('img/proposal_cover.svg',documentPixelWidth,documentPixelWidth/ratio));
            $q.all(promises).then(function(result){
                renderPageOne(result);
            });
        }
    };

    // ------------------------ PROTECTIONS OVERVIEW ------------------------
    render.overview = function() {
        doc.addPage();

        //OVERVIEW TITLE
        exportUtility.renderHeading(doc,$translate.instant("COVERAGE_BREAKDOWN"));

        //DRAW CHART
        var chart_width = 1000;
        var chartOptions = barChartService.getChartOptions({
            animation               : false,
            scaleFontSize           : Math.floor(chart_width/4000 * 90),
            xAxisFontSize           : Math.floor(chart_width/4000 * 90),
            barValueSpacing         : Math.floor(chart_width/4000 * 50),
            xAxisSpaceBefore        : Math.floor(chart_width/4000 * 50),
            xAxisLabelSpaceBefore   : Math.floor(chart_width/4000 * 100),
            yAxisSpaceLeft          : Math.floor(chart_width/4000 * 100),
            scaleLineWidth          : Math.floor(chart_width/4000 * 10),
        });


        var chartData = barChartService.getOverviewChartData($scope.viewObj.overviewData.lump);
        exportUtility.drawChart("overviewChart-export", chartData, chartOptions, chart_width, chart_width * 0.67);
        var chartData = barChartService.getOverviewChartData($scope.viewObj.overviewData.income);
        exportUtility.drawChart("overviewIncomeChart-export", chartData, chartOptions, chart_width, chart_width * 0.48);

        //RENDER CHART TO IMAGE
        $timeout(function(){
            var chartOutputWidth = ele_width * 0.63;

            exportUtility.drawChartImage(doc, "overviewChart-export", marginLeftLess, marginTopAdj, chartOutputWidth, null);
            exportUtility.drawChartImage(doc, "overviewIncomeChart-export", marginLeftLess, marginTopAdj + 310, chartOutputWidth, null);

            //OVERVIEW TABLE
            exportUtility.setRenderFont(doc,11);
            doc.fromHTML($('#overviewTable-export').get(0), chartOutputWidth + 60, marginTopAdj - 5, {
                'width': 335
            });
            doc.fromHTML($('#financialInfoTable-export').get(0), chartOutputWidth + 60, marginTopAdj - 5 + 310, {
                'width': 335
            });

            nextPage();
        },333);
    };

    // ------------------------ KEY PROTECTIONS ------------------------
    render.keyProtections = function() {
        doc.addPage();

        //DOUGHNUT TITLE
        exportUtility.renderHeading(doc,$translate.instant("KEY_PROTECTION_TITLE"));


        var promises = [];
        angular.forEach($scope.viewObj.cat, function(cat,index){
            promises.push(exportUtility.getImageDataUrl('img/icons/' + cat.title + '.png',500,500));
        });
        $q.all(promises).then(function(result){

            var cell_width = ele_height * 0.41;
            var doughnut_width = cell_width * 0.85;
            var doughnut_shift = cell_width * 0.1;
            var icon_factor = 0.3;
            var icon_width = doughnut_width * icon_factor;
            var margin_factor = 1/2 - 0.3/2;
            var icon_margin_width = doughnut_width * margin_factor;

            function render(cat,index) {
                var dfd = $q.defer();
                //DRAW CHART
                var doughnutChartOptions = doughnutChartService.getChartOptions({
                    animation : false,
                    annotateDisplay: false
                });
                exportUtility.drawDoughnutChart2(cat,index,doughnutChartOptions);
                $timeout(function(){
                    // DOUGHNUT
                    var shiftX = (cell_width + 18) * ((index) % 4);
                    var shiftY = index + 1 > 4 ? doughnut_width + 15 + 95 : 0 ;

                    //TITLE
                    exportUtility.setRenderFont(doc,9,"bold");
                    doc.fromHTML($('#catTitle' + index).get(0),
                        marginLeftLess + shiftX + 5,
                        marginTopAdj + -5 + shiftY,
                        {
                            'width' : cell_width
                        }
                    );

                    //CHART
                    exportUtility.drawChartImage(doc, "doughnut-export" + index, marginLeftLess + shiftX + doughnut_shift, marginTopAdj + 25 + shiftY, doughnut_width, doughnut_width);
                    doc.addImage(result[index].dataUrl, 'JPEG', marginLeftLess + icon_margin_width + shiftX + doughnut_shift, marginTopAdj + 25 + icon_margin_width + shiftY, icon_width, icon_width);

                    //TABLE
                    exportUtility.setRenderFont(doc,8);
                    doc.fromHTML($('#doughnut-exportTable' + index).get(0),
                        marginLeftLess + shiftX,
                        marginTopAdj + 25 + doughnut_width + shiftY - 10,
                        {
                            'width' : cell_width
                        }
                    );

                    dfd.resolve("OK");
                },1);

                return dfd.promise;
            }

            var renderChartPromises = [];
            angular.forEach($scope.viewObj.cat, function(cat,index) {
                renderChartPromises.push(render(cat,index));
            });

            $q.all(renderChartPromises).then(function(){
                nextPage();
            });

        });
    };

    // ------------------------ PROTECTIONS TREND ------------------------
    render.protectionsTrend = function() {
        doc.addPage();

        //OVERVIEW TITLE
        exportUtility.renderHeading(doc,$translate.instant("COVERAGE_TREND"));

        var chart_width = 500;
        //var coverageChartData = lineChartService.getAllCoverageTrendChartData(policyDataDbService.getCoverageTrend());
        var coverageTrendData = policyDataDbService.getCoverageTrend();
        var chartOptions = lineChartService.getChartOptions({
            animation               : false,
            scaleFontSize           : Math.floor(chart_width/4000 * 150),
            xAxisFontSize           : Math.floor(chart_width/4000 * 150),
            xAxisSpaceBefore        : Math.floor(chart_width/4000 * 30),
            xAxisLabelSpaceBefore   : Math.floor(chart_width/4000 * 30),
            yAxisSpaceLeft          : Math.floor(chart_width/4000 * 100),
            yAxisSpaceRight         : Math.floor(chart_width/4000 * 100),
            scaleLineWidth          : Math.floor(chart_width/4000 * 50),
            scaleGridLineWidth      : Math.floor(chart_width/4000 * 30),
            pointDotRadius          : Math.floor(chart_width/4000 * 60),
            datasetStrokeWidth      : Math.floor(chart_width/4000 * 40),
            spaceTop                : Math.floor(chart_width/4000 * 50),
        });


        var cell_width = ele_height * 0.41;
        var doughnut_width = cell_width * 1.1;
        var doughnut_shift = cell_width * 0.05;
        var icon_factor = 0.3;
        var icon_width = doughnut_width * icon_factor;
        var margin_factor = 1/2 - 0.3/2;
        var icon_margin_width = doughnut_width * margin_factor;

        //console.log(coverageTrendData);

        angular.forEach(coverageTrendData.data, function(cat,index) {
            //DRAW CHART
            var chosenCoverageTrendData = coverageTrendData;
            chosenCoverageTrendData.data = cat;
            coverageChartData = lineChartService.getCoverageTrendChartData(chosenCoverageTrendData);

            exportUtility.drawLineChart("coverageChart-export" + index, coverageChartData, chartOptions, chart_width, chart_width * 1.1);
            $timeout(function(){
                // DOUGHNUT
                var shiftX = (cell_width + 18) * ((index) % 4);
                var shiftY = index + 1 > 4 ? doughnut_width + 15 + 50 : 0 ;

                //TITLE
                exportUtility.setRenderFont(doc,9,"bold");
                doc.fromHTML($('#catTitle' + index).get(0),
                    marginLeftLess + shiftX,
                    marginTopAdj + -5 + shiftY,
                    {
                        'width' : cell_width
                    }
                );

                //CHART
                exportUtility.drawChartImage(doc, "coverageChart-export" + index, marginLeftLess - 20 + shiftX + doughnut_shift, marginTopAdj + 25 + shiftY, doughnut_width, null);

            },1);
        });

        $timeout(function(){
            nextPage();
        },1 * 8);
    };

    // ------------------------ FULL TABLE ------------------------
    render.fullTable = function() {
        for (var i = 1 ; i <= 2 ; i++) {
            doc.addPage();

            //POLICY TABLE TITLE
            exportUtility.renderHeading(doc,$translate.instant("POLICY_TABLE_" + i));

            //FULL TABLE
            doc.setOverflowHook(function(){
                exportUtility.renderHeading(doc,$translate.instant("POLICY_TABLE_" + i));
            });
            exportUtility.setRenderFont(doc,7);
            doc.fromHTML($('#fullTable' + i + '-export').get(0), 20 , marginTopAdj, {
                'width' : 810
            });
            doc.setOverflowHook(undefined);
        }

        nextPage();
    };

    // ------------------------ NET WORTH ------------------------
    render.netWorth = function() {
        doc.addPage();

        //OVERVIEW TITLE
        exportUtility.renderHeading(doc,$translate.instant("NET_WORTH_ANALYSIS"));

        var documentPixelHeight = 800;
        var promises = [];
        promises.push(exportUtility.getImageDataUrl('img/netWorth_export.svg',documentPixelHeight,null));
        promises.push(exportUtility.getImageDataUrl('img/asset.svg'          ,documentPixelHeight,null));
        promises.push(exportUtility.getImageDataUrl('img/liability.svg'      ,documentPixelHeight,null));
        promises.push(exportUtility.getImageDataUrl('img/cashflow_export.svg',documentPixelHeight,null));

        $q.all(promises).then(function(result){

            doc.addImage(result[0].dataUrl, 'JPEG', 285, marginTopAdj + 20 + 15 + 330, 280, 280/result[0].ratio);
            doc.addImage(result[1].dataUrl, 'JPEG', 0  , marginTopAdj + 15           , 280, 280/result[1].ratio);
            doc.addImage(result[2].dataUrl, 'JPEG', 285, marginTopAdj + 15           , 280, 280/result[2].ratio);
            doc.addImage(result[3].dataUrl, 'JPEG', 585, marginTopAdj + 15           , 240, 240/result[3].ratio);

            exportUtility.setRenderFont(doc,13);
            doc.fromHTML($('#assetsTable-export').get(0), 10, marginTopAdj + 5, {
                'width': 255
            });
            doc.fromHTML($('#liabilitiesTable-export').get(0), 295, marginTopAdj + 5, {
                'width': 255
            });
            doc.fromHTML($('#cashflowTable-export').get(0), 585, marginTopAdj + 5, {
                'width': 240
            });
            doc.fromHTML($('#netWorthTotalTable-export').get(0), 295, marginTopAdj + 15 + 340, {
                'width': 255
            });

            nextPage();
        });
    }

    // ------------------------ FINANCIAL RATIO ------------------------
    render.policiesAnalysis = function() {
        doc.addPage();

        //OVERVIEW TITLE
        exportUtility.renderHeading(doc,$translate.instant("KEY_NEEDS_SUMMARY_POLICIES_ANALYSIS"));


        //PROTECTION TABLE
        exportUtility.setRenderFont(doc,10);
        doc.fromHTML($('#protectionsTable-export').get(0), marginLeftLess , marginTopAdj + 5, {
            'width' : 380
        });



        //CASH VALUE TABLE
        exportUtility.setRenderFont(doc,10);
        doc.fromHTML($('#cashValueTable-export').get(0), marginLeftLess, marginTopAdj + 5 + 270, {
            'width' : 378
        });


        exportUtility.setRenderFont(doc,10);
        doc.fromHTML($('#policyInfoTable-export').get(0), marginLeftLess + 375 + 40, marginTopAdj + 5 + 333, {
            'width' : 385
        });


        var premiumTrendData = policyDataDbService.getPremiumTrend();
        var premiumChartData = lineChartService.getPremiumTrendChartData(premiumTrendData);

        var chart_width = 800;
        var chartOptions = lineChartService.getChartOptions({
            animation               : false,
            scaleFontSize           : Math.floor(chart_width/4000 * 110),
            xAxisFontSize           : Math.floor(chart_width/4000 * 110),
            barValueSpacing         : Math.floor(chart_width/4000 * 50),
            xAxisSpaceBefore        : Math.floor(chart_width/4000 * 25),
            xAxisLabelSpaceBefore   : Math.floor(chart_width/4000 * 25),
            yAxisSpaceLeft          : Math.floor(chart_width/4000 * 100),
            yAxisSpaceRight         : Math.floor(chart_width/4000 * 100),
            scaleLineWidth          : Math.floor(chart_width/4000 * 20),
            scaleGridLineWidth      : Math.floor(chart_width/4000 * 20),
            pointDotRadius          : Math.floor(chart_width/4000 * 50),
            datasetStrokeWidth      : Math.floor(chart_width/4000 * 40),
            spaceTop                : Math.floor(chart_width/4000 * 250),
        });
        if (premiumChartData.shapesInChart !== undefined) {
            premiumChartData.shapesInChart[0].fontSize = Math.floor(chart_width/4000 * 100);
            premiumChartData.shapesInChart[1].strokeSize = Math.floor(chart_width/4000 * 20);
        }

        exportUtility.drawLineChart("premiumTrendChart-export", premiumChartData, chartOptions, chart_width, chart_width * 0.8);

        $timeout(function() {
            var chartOutputWidth = ele_width * 0.6;
            exportUtility.drawChartImage(doc, "premiumTrendChart-export", marginLeftLess + 375 + 25, marginTopAdj + 5, chartOutputWidth, null);

            nextPage();
        },333);





    };

    // ------------------------ FINANCIAL RATIOS ------------------------
    render.financialRatios = function() {
        doc.addPage();

        //OVERVIEW TITLE
        exportUtility.renderHeading(doc,$translate.instant("FINANCIAL_RATIOS"));

        //FINANCIAL RATIOS TABLE
        exportUtility.setRenderFont(doc,10);
        doc.fromHTML($('#financialRatioTable-export').get(0), marginLeftLess, marginTopAdj + 5, {
            'width': 380
        });

        nextPage();
    };


    // ------------------------ NEEDS ------------------------
    render.needs = function() {
        doc.addPage();

        //LEGEND TITLE
        exportUtility.renderHeading(doc,$translate.instant("KEY_PROTECTION_NEEDS_EXPLAINED"));

        //LEGEND TABLE
        exportUtility.setRenderFont(doc,10);
        doc.fromHTML($('#chartLegendTable-export').get(0), 20 , marginTopAdj - 5, {
            'width' : 810
        });

        //DISCLAIMER
        exportUtility.setRenderFont(doc,10);
        doc.text(marginLeft - 10, marginTop + 500 + 30, $translate.instant("LEGEND_DISCLAIMER"));

        nextPage();
    };

    // ------------------------ DISCLAIMER ------------------------
    render.disclaimer = function() {
        doc.addPage();

        //DISCLAIMER TITLE
        exportUtility.renderHeading(doc,$translate.instant("DISCLAIMER"));

        //DISCLAIMER CONTENT
        exportUtility.setRenderFont(doc,13);
        doc.fromHTML($('#disclaimerTable-export').get(0), 20 , marginTopAdj, {
            'width' : 800
        });

        nextPage();
    };
}]);

