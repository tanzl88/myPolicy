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

app.controller('ClientDashboardCtrl', ['$rootScope', '$scope', '$state', '$timeout', '$interval', '$translate', '$filter', 'credentialManager', 'policyDataService', 'doughnutChartService', 'findParentService', 'modalService', function($rootScope,$scope,$state,$timeout,$interval,$translate,$filter,credentialManager,
                                               policyDataService,doughnutChartService,findParentService,modalService) {

    //$scope.credential = credentialManager.getCredential();
    var parentScope = findParentService.findByFunctionName($scope,"initVar");
    var animateDashboard = true;
    $rootScope.$on("LOGOUT", function(){
        animateDashboard = true;
        //$scope.credential = undefined;
    });
    parentScope.meterAnimate = function() {
        $scope.meterData = policyDataService.getMeterData();
        drawMeter();
        animatePercent();
    };

    function animateInflate(DOM,scale) {
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
    }
    function animateInflatePercent(DOM,scale) {
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
    function animatePercent() {
        if (animateDashboard) {
            $scope.percentAnimate = 0;
            var percentAnimateTimer = $interval(function(){
                if ($scope.percentAnimate < $scope.meterData.percent) {
                    $scope.percentAnimate += 1;
                } else {
                    $interval.cancel(percentAnimateTimer);
                    animateInflatePercent($("#percent_container"),1.2);
                    animateInflate($("#client-doughnut"),1.1);
                }
            },5);
        } else {
            $scope.percentAnimate = $scope.meterData.percent;
            animateInflatePercent($("#percent_container"),1.2);
            animateInflate($("#client-doughnut"),1.1);
        }
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
                //var chart_width = Math.floor(window_width_g * 0.7);
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
                $interval.cancel(initTimer);
            }
        },100);
    };


    // -------------------- TOOLTIP MODAL --------------------
    $scope.showDoughnutTooltip = function() {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Tooltip', 'Score');

        $scope.highlightType = undefined
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
}]);

