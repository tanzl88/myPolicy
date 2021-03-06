app.controller('ExportCtrl', ['$scope', '$rootScope', '$q', '$translate', '$timeout', '$interval', '$ionicHistory', '$cordovaFile', '$toast', '$filter', 'advisorDataDbService', 'personalDataDbService', 'policyDataDbService', 'policyDataService', 'barChartService', 'doughnutChartService', 'picNotesService', 'loadingService', 'exportUtility', function($scope,$rootScope,$q,$translate,$timeout,$interval,$ionicHistory,$cordovaFile,$toast,$filter,
                                      advisorDataDbService,personalDataDbService,policyDataDbService,
                                      policyDataService,barChartService,doughnutChartService,picNotesService,
                                      loadingService,exportUtility) {
    var exportStartTime = Date.now();
    $scope.currency = $translate.instant("CURRENCY").trim();
    $scope.viewObj = {};
    $scope.viewObj.advisorData      = advisorDataDbService.getData();
    $scope.viewObj.clientData       = personalDataDbService.getData();
    $scope.viewObj.overviewData     = policyDataService.getOverviewData();
    $scope.viewObj.protectionsData  = $scope.viewObj.overviewData.slice(0).splice(0,10);
    $scope.viewObj.financialData    = $scope.viewObj.overviewData.slice(0).splice(10,5);
    $scope.viewObj.cat              = policyDataService.getProtectionsData();
    $scope.viewObj.sums             = policyDataDbService.getAllSum();
    $scope.fullTableColumns         = [full_table_g_1,full_table_g_2];
    $scope.policies                 = angular.copy(policyDataDbService.getPolicies());
    $scope.fullTableSections        = [];


    //POST PROCESS POLICIES FOR REACT
    var fullTableObj = [];
    for (var i = 0 ; i <= 1 ; i++) {
        var fullTableColumns = $scope.fullTableColumns[i];
        fullTableObj.push({
            head : [],
            body : []
        });
        //HEAD
        angular.forEach(fullTableColumns,function(col,index){
            fullTableObj[i].head.push({
                title : $translate.instant(col.title),
                width : col.width
            });
        });
        //BODY
        angular.forEach($scope.policies,function(policy,policyIndex){
            var rowArray = [];
            angular.forEach(fullTableColumns,function(col,index){
                if (col.type === "currency") {
                    rowArray.push($filter("currency")(policy[col.varName],"",0));
                } else {
                    rowArray.push(policy[col.varName]);
                }
            });
            fullTableObj[i].body.push(rowArray);
        });
        //SUM
        if (i === 1) {
            var rowArray = [];
            var sumColStart = 2;
            for (var j = 0; j < fullTableColumns.length; j++) {
                if (j < sumColStart) {
                    rowArray.push(undefined);
                } else {
                    rowArray.push($filter("currency")($scope.viewObj.sums[j - sumColStart], "", 0));
                }
            }
            fullTableObj[i].body.push(rowArray);
        }
    }
    $scope.fullTableObj = fullTableObj;

    var ratio = 1.4142857143;

    //STYLING
    var marginLeft = 30;
    var marginLeftLess = 20;
    var marginTop = 45;
    var marginTopAdj = marginTop + 15;
    var doc_width = 845;
    var doc_height = 598;
    var ele_width = (doc_height - (marginTop * 2)) * 0.90;
    var doc;

    $scope.initVar = function() {
        $timeout(function(){
            if (validity_test($rootScope.reportName)) {
                $scope.reportName = $rootScope.reportName;
                delete $rootScope.reportName;
                doc = new jsPDF('l','pt','a4');
                pageOne();
                //pageFour();
            } else {
                reportComplete(false);
            }
        },100);
    };

    function reportComplete(refresh) {
        if (refresh) $("#report_list_view").scope().initVar();
        $ionicHistory.goBack();
        $timeout(function(){
            loadingService.hide();
            //ANALYTICS
            if (ionic.Platform.isWebView()) window.analytics.trackTiming('PROCESS', Date.now() - exportStartTime, 'Export', 'Generate reports');
        },400);

    }

    function renderPageOne(result) {
            //BACKGROUND
            doc.addImage(result[0].dataUrl, 'JPEG', 0, 0, doc_width, doc_width/result[0].ratio);

            //LOGO
            //var logoSize = doc_width / 8;
            if (result[1] !== undefined) {
                var logoHeight = 80;
                var logoWidth  = logoHeight * result[1].ratio;
                doc.addImage(result[1].dataUrl, 'JPEG', doc_width - logoWidth - 20, 20, logoWidth, logoHeight);
            }

            //TITLE
            exportUtility.setRenderFont(doc,55,"bold",[64,64,64]);
            doc.text(doc_width / 6, doc_height * 0.42, $translate.instant("INSURANCE_PROPOSAL"));
            exportUtility.setRenderFont(doc,35,"bold",[64,64,64]);
            doc.text(doc_width / 6, doc_height * 0.42 + 45, 'for ' + $scope.viewObj.clientData.name);
            exportUtility.setRenderFont(doc,30,"bold",[64,64,64]);
            doc.text(doc_width / 6, doc_height * 0.42 + 45 + 40, moment().format("LL"));

            //SIGNATURE
            exportUtility.setRenderFont(doc,13);
            var signature = "";
            if ($scope.viewObj.advisorData.name)    signature   += $scope.viewObj.advisorData.name + "\n";
            if ($scope.viewObj.advisorData.title)   signature   += $scope.viewObj.advisorData.title + "\n";
            if ($scope.viewObj.advisorData.agency)  signature   += $scope.viewObj.advisorData.agency + "\n";
            if ($scope.viewObj.advisorData.company) signature   += $scope.viewObj.advisorData.company + "\n";
            if ($scope.viewObj.advisorData.repNo)   signature   += "Rep No: " + $scope.viewObj.advisorData.repNo + "\n";
            if ($scope.viewObj.advisorData.address) signature   += "Add: " + $scope.viewObj.advisorData.address + "\n";
            if ($scope.viewObj.advisorData.phone)   signature   += "Tel: " + $scope.viewObj.advisorData.phone + "\n";
            if ($scope.viewObj.advisorData.email)   signature   += "Email: " + $scope.viewObj.advisorData.email + "\n";
            if ($scope.viewObj.advisorData.website) signature   += "Website: " + $scope.viewObj.advisorData.website;

            var signature = signature.trim();
            var numberOfLines = signature.split(/\r\n|\r|\n/).length;
            doc.text(doc_width - 20, doc_height - 13 * numberOfLines - 30, signature, "", 0, "right");

            //GO TO PAGE TWO
            pageTwo();
            //save();
    }

    function pageOne() {
        //FIRST PAGE
        var documentPixelWidth = 2000;
        var promises = [];
        if (advisorDataDbService.getData().logo === true) {
            if (ionic.Platform.isWebView()) {
                picNotesService.getLogo().then(function(logoUrl){
                    promises.push(exportUtility.getImageDataUrl('img/proposal_cover.jpg',documentPixelWidth,documentPixelWidth/ratio));
                    promises.push(exportUtility.getImageDataUrl(logoUrl.src,null,500));
                    $q.all(promises).then(function(result){
                        renderPageOne(result);
                    });
                });
            } else {
                promises.push(exportUtility.getImageDataUrl('img/proposal_cover.jpg',documentPixelWidth,documentPixelWidth/ratio));
                $q.all(promises).then(function(result){
                    renderPageOne(result);
                });
            }
        } else {
            promises.push(exportUtility.getImageDataUrl('img/proposal_cover.jpg',documentPixelWidth,documentPixelWidth/ratio));
            $q.all(promises).then(function(result){
                renderPageOne(result);
            });
        }
    }


    //SECOND PAGE
    function pageTwo() {
        doc.addPage();

        //OVERVIEW TITLE
        exportUtility.renderHeading(doc,$translate.instant("COVERAGE_BREAKDOWN"));

        //DRAW CHART
        var chartData = barChartService.getOverviewChartData($scope.viewObj.overviewData);
        var chart_width = 2000;
        var chartOptions = barChartService.getChartOptions({
            animation               : false,
            scaleFontSize           : Math.floor(chart_width/4000 * 90),
            xAxisFontSize           : Math.floor(chart_width/4000 * 90),
            barValueSpacing         : Math.floor(chart_width/4000 * 110),
            xAxisSpaceBefore        : Math.floor(chart_width/4000 * 50),
            xAxisLabelSpaceBefore   : Math.floor(chart_width/4000 * 100),
            yAxisSpaceLeft          : Math.floor(chart_width/4000 * 100),
            scaleLineWidth          : Math.floor(chart_width/4000 * 10),
        });

        exportUtility.drawChart("overviewChart-export", chartData, chartOptions, chart_width/1.15, chart_width);

        //RENDER CHART TO IMAGE
        $timeout(function(){
            var overviewChartEle = document.getElementById("overviewChart-export");
            var overviewChart = overviewChartEle.toDataURL("image/jpeg",0.7);
            var overviewChartRatio = $(overviewChartEle).attr("width") / $(overviewChartEle).attr("height");
            doc.addImage(overviewChart, 'JPEG', marginLeftLess, marginTopAdj + 20, ele_width * 1.05 * overviewChartRatio, ele_width * 1.05);

            //OVERVIEW TABLE
            exportUtility.setRenderFont(doc,11);
            doc.fromHTML($('#overviewTable-export').get(0), ele_width * overviewChartRatio + 85, marginTopAdj + 10, {
                'width': 335
            });
            doc.fromHTML($('#financialInfoTable-export').get(0), ele_width * overviewChartRatio + 85, marginTopAdj + 10 + 320, {
                'width': 335
            });

            //GO TO PAGE THREE
            pageThree();
        },333);
    }

    function pageThree() {
        doc.addPage();

        //DOUGHNUT TITLE
        exportUtility.renderHeading(doc,$translate.instant("KEY_PROTECTION_TITLE"));


        var promises = [];
        angular.forEach($scope.viewObj.cat, function(cat,index){
            promises.push(exportUtility.getImageDataUrl('img/icons/' + cat.title + '.png',500,500));
        });
        $q.all(promises).then(function(result){

            var cell_width = ele_width * 0.41;
            var doughnut_width = cell_width * 0.9;
            var doughnut_shift = cell_width * 0.05;
            var icon_factor = 0.3;
            var icon_width = doughnut_width * icon_factor;
            var margin_factor = 1/2 - 0.3/2;
            var icon_margin_width = doughnut_width * margin_factor;

            //PROTECTION TABLE
            exportUtility.setRenderFont(doc,7);
            doc.fromHTML($('#protectionsTable-export').get(0), marginLeftLess , marginTopAdj - 5, {
                'width' : cell_width
            });


            angular.forEach($scope.viewObj.cat, function(cat,index)
            {
                //DRAW CHART
                var doughnutChartOptions = doughnutChartService.getChartOptions({
                    animation : false
                });
                exportUtility.drawDoughnutChart2(cat,index,doughnutChartOptions);

                $timeout(function(){
                    // DOUGHNUT
                    var shiftX = (cell_width + 18) * ((index + 1) % 4);
                    var shiftY = index + 1 > 3 ? doughnut_width + 15 + 85 : 0 ;

                    //TITLE
                    exportUtility.setRenderFont(doc,10,"bold");
                    doc.text(marginLeftLess + shiftX, marginTopAdj + 15 + shiftY, $translate.instant(cat.title));

                    //CHART
                    var doughnutChartEle = document.getElementById("doughnut-export" + index);
                    var doughnutChart = doughnutChartEle.toDataURL("image/jpeg",0.7);
                    doc.addImage(doughnutChart, 'JPEG', marginLeftLess + shiftX + doughnut_shift, marginTopAdj + 25 + shiftY, doughnut_width, doughnut_width);
                    doc.addImage(result[index].dataUrl, 'JPEG', marginLeftLess + icon_margin_width + shiftX + doughnut_shift, marginTopAdj + 25 + icon_margin_width + shiftY, icon_width, icon_width);

                    //TABLE
                    exportUtility.setRenderFont(doc,8);
                    doc.fromHTML($('#doughnut-exportTable' + index).get(0),
                        marginLeftLess + shiftX,
                        marginTopAdj + 25 + doughnut_width + shiftY - 10,
                        {
                            'width': cell_width
                        }
                    );
                },333);


            });

            $timeout(function(){
                pageFour();
            },333 * 8);

        });
    }

    //PAGE FOUR
    function pageFour() {
        for (var i = 1 ; i <= 2 ; i++) {
            //for (var j = 0 ; j < $scope.fullTableSections.length ; j++) {
            //    doc.addPage();
            //
            //    //POLICY TABLE TITLE
            //    exportUtility.renderHeading(doc,$translate.instant("POLICY_TABLE_" + i));
            //
            //    //FULL TABLE
            //    exportUtility.setRenderFont(doc,7);
            //    doc.fromHTML($('#fullTable' + i + '-export' + j).get(0), 20 , marginTopAdj, {
            //        'width' : 810
            //    });
            //}

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

        pageFive();
    }

    //PAGE FIVE
    function pageFive() {
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

        pageSix();
    }

    //PAGE SIX
    function pageSix() {
        doc.addPage();

        //DISCLAIMER TITLE
        exportUtility.renderHeading(doc,$translate.instant("DISCLAIMER"));

        //DISCLAIMER CONTENT
        exportUtility.setRenderFont(doc,13);
        doc.fromHTML($('#disclaimerTable-export').get(0), 20 , marginTopAdj, {
            'width' : 800
        });

        save();
    }

    function save() {
        if (ionic.Platform.isWebView()) {
            $cordovaFile.writeFile(fileTransferDir, $scope.reportName, doc.output("blob"), true)
                .then(function (success) {
                    // success
                    console.log(success);
                    reportComplete(true);
                }, function (error) {
                    console.log(error);
                    $toast.show("GENERATE_REPORT_FAILED");
                    reportComplete(false);
                    // error
                });
        } else {
            var pdfOutput = doc.save('sample-file.pdf');
        }
    }

}]);

