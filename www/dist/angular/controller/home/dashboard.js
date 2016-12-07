app.controller('AdvisorDashboardCtrl', ['$rootScope', '$scope', '$timeout', 'findParentService', function($rootScope,$scope,$timeout,findParentService) {
    var parentScope = findParentService.findByFunctionName($scope,"initVar");
    function animateDashboard(fadeInTime,translate,opacity) {
        var greetEl = $("#dashboard_section .greet");
        var selectEl = $("#dashboard_section .client_select");
        $(greetEl).fadeTo(fadeInTime,opacity);

        TweenLite.to(greetEl, fadeInTime/1000, {
            x: translate,
            ease : Power1.easeIn
        });

        $timeout(function(){
            $(selectEl).fadeTo(fadeInTime,opacity);
            TweenLite.to(selectEl, fadeInTime/1000, {
                x: translate,
                ease : Power1.easeIn
            });
        },fadeInTime);
    }
    //var animateDashboard = true;
    $rootScope.$on("LOGOUT", function(){
        animateDashboard(0,-window_width_g * 0.05,0.01);
    });
    parentScope.dashboardAnimate = function() {
        animateDashboard(666,0,1);
    };
}]);

app.controller('ClientDashboardCtrl', ['$rootScope', '$scope', '$state', '$timeout', '$interval', '$translate', '$filter', '$ionicScrollDelegate', 'credentialManager', 'policyDataService', 'doughnutChartService', 'dashboardService', 'findParentService', 'modalService', function($rootScope,$scope,$state,$timeout,$interval,$translate,$filter,$ionicScrollDelegate,credentialManager,
                                               policyDataService,doughnutChartService,dashboardService,findParentService,modalService) {

    //$scope.credential = credentialManager.getCredential();
    var parentScope = findParentService.findByFunctionName($scope,"initVar");
    var animateDashboard = true;
    $rootScope.$on("LOGOUT", function(){
        animateDashboard = true;
        //$scope.credential = undefined;
    });
    parentScope.meterAnimate = function() {
        $scope.meterData = policyDataService.getMeterData();
        $scope.ratioMeterData = policyDataService.getRatioMeterData();
        drawMeter();
        animatePercent();
    };

    function animatePercent() {
        if (animateDashboard) {
            $scope.percentAnimate = 0;
            var percentAnimateTimer = $interval(function(){
                if ($scope.percentAnimate < $scope.meterData.percent) {
                    $scope.percentAnimate += 1;
                } else {
                    $interval.cancel(percentAnimateTimer);
                    dashboardService.animateInflatePercent($("#percent_container"),1.2);
                    dashboardService.animateInflate($("#client-doughnut"),1.1);
                }
            },5);
        } else {
            $scope.percentAnimate = $scope.meterData.percent;
            dashboardService.animateInflatePercent($("#percent_container"),1.2);
            dashboardService.animateInflate($("#client-doughnut"),1.1);
        }

        $scope.ratioPercent = $scope.ratioMeterData.score.toFixed(0);
    }
    function drawMeter() {
        var initTimer;
        initTimer = $interval(function(){
            var ele_to_check = $("#dashboard_section .doughnut_container canvas");
            if (ele_to_check.length > 0) {
                //CALC CHART DIMENSION
                var view_height = $("#home_view ion-content").height();
                var coverage_number_height = $("#dashboard_coverage_number").height();
                var chart_width = (view_height * 0.6 - coverage_number_height) * 0.9;
                //STYLE CHART / WRAPPER DIMENSION
                $("#dashboard_section .doughnut_container").width(chart_width).height(chart_width);
                $(ele_to_check).attr("width",chart_width).attr("height",chart_width);
                doughnutChartService.drawChart("client-doughnut", $scope.meterData.chartData, doughnutChartService.getChartOptions({
                    percentageInnerCutout: 60,
                    spaceTop: 1,
                    spaceBottom: 1,
                    spaceLeft: 1,
                    spaceRight: 1,
                    animation : animateDashboard,
                    animationSteps: 50,
                    annotateDisplay: false
                }));
                animateDashboard = false;
                doughnutChartService.drawChart("client-ratio-doughnut", $scope.ratioMeterData.chartData, doughnutChartService.getChartOptions({
                    percentageInnerCutout: 60,
                    spaceTop: 1,
                    spaceBottom: 1,
                    spaceLeft: 1,
                    spaceRight: 1,
                    animation : animateDashboard,
                    animationSteps: 50,
                    annotateDisplay: false
                }));
                $interval.cancel(initTimer);
            }
        },100);
    };

    //---------------------SWIPER---------------------
    $scope.dashboardSwiper = new Swiper('#dashboard_section.swiper-container', {
        paginationHide  : true
    });


    // -------------------- TOOLTIP MODAL --------------------
    $scope.showDoughnutTooltip = function() {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Tooltip', 'Score');

        $scope.highlightType = undefined;
        var varReplace = {
            percent     : $scope.meterData.percent,
            current     : $filter('currency')($scope.meterData.cover,$scope.currency,0),
            suggested   : $filter('currency')($scope.meterData.suggest,$scope.currency,0)
        };
        $scope.dashboardDoughnutTooltip = $translate.instant("YOUR_PROTECTION_TOOLTIP",varReplace);
        $scope.doughnutTooltip.show();
    };
    modalService.init("doughnutTooltip","dashboardDoughnutTooltip",$scope).then(function(modal){
        $scope.doughnutTooltip = modal;
    });
    $scope.showRatioDoughnutTooltip = function() {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'RatioTooltip', 'Score');

        $scope.highlightType = undefined;
        var varReplace = {
            percent     : $scope.ratioMeterData.score.toFixed(0)
        };
        $scope.dashboardRatioDoughnutTooltip = $translate.instant("YOUR_FINANCIAL_TOOLTIP",varReplace);
        $scope.ratioDoughnutTooltip.show();
    };
    modalService.init("ratioDoughnutTooltip","dashboardRatioDoughnutTooltip",$scope).then(function(modal){
        $scope.ratioDoughnutTooltip = modal;
    });



    $scope.showCoverageStatusTooltip = function(type) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Tooltip', 'Coverage status');

        $scope.highlightType = type;
        $scope.coverageStatus = $translate.instant(type.toUpperCase() + "_TOOLTIP");
        $scope.coverageStatusNeeds = $scope.meterData[type + "P"];
        $scope.coverageStatusTooltip.show();
    };
    modalService.init("coverageStatusTooltip","coverageStatusTooltip",$scope).then(function(modal){
        $scope.coverageStatusTooltip = modal;
    });
    $scope.showRatioTooltip = function(type) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'ratioTooltip', 'Ratio status');

        $scope.highlightType = type;
        $scope.coverageStatus = $translate.instant(type.toUpperCase() + "_TOOLTIP");
        $scope.coverageStatusNeeds = $scope.ratioMeterData[type + "P"];
        $scope.ratioTooltip.show();
    };
    modalService.init("ratioTooltip","ratioTooltip",$scope).then(function(modal){
        $scope.ratioTooltip = modal;
    });



    $scope.goToReport = function(type) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Tooltip', 'Go to report');

        $scope.doughnutTooltip.hide();
        $scope.coverageStatusTooltip.hide();

        $state.go("tabs.reports.overview");
        $timeout(function(){
            //HIGHLIGHT
            $state.go("tabs.reports.report");
            $timeout(function(){
                angular.forEach($scope.meterData[type + "P"],function(cat,index){
                    var DOM = $("#" + cat.toUpperCase() + "_ROW td");
                    $(DOM).css("background-color","#FED82F");
                    $timeout(function(){
                        TweenLite.to(DOM, 0.2, {
                            css: { "backgroundColor" : "#FFFFFF" },
                            //ease: Power1.easeInOut
                        });
                    },2500);
                });
            },333);
        },1);
    };
    $scope.goToRatio = function(type) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'ratioTooltip', 'Go to ratio');

        $scope.ratioDoughnutTooltip.hide();
        $scope.ratioTooltip.hide();

        $state.go("tabs.reports.overview");
        $timeout(function(){
            //HIGHLIGHT
            $state.go("tabs.reports.netWorth");
            $timeout(function(){
                $ionicScrollDelegate.$getByHandle('netWorth').scrollBottom(true);
                angular.forEach($scope.ratioMeterData[type + "P"],function(cat,index){
                    var DOM = $("#" + cat.toUpperCase() + "_ROW td");
                    $(DOM).css("background-color","#FED82F");
                    $timeout(function(){
                        TweenLite.to(DOM, 0.2, {
                            css: { "backgroundColor" : "#FFFFFF" },
                            //ease: Power1.easeInOut
                        });
                    },2500);
                });
            },333);
        },1);
    };
}]);

