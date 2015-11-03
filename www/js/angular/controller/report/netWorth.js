app.controller('NetWorthCtrl', function($scope,$translate,$timeout,$interval,$toast,$state,$ionicScrollDelegate,credentialManager,
                                        policyDataService,policyDataDbService,personalDataDbService,barChartService,lineChartService) {

    $scope.initVar = function() {
        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('report').scrollTop();

        //CHECK CLIENT SELECTED
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();
        $scope.personal = angular.copy(personalDataDbService.getData());
        //NULLIFY MISSING VARIABLES
        $scope.personal.cashAssets          = $scope.personal.cashAssets === undefined          ? 0 : $scope.personal.cashAssets;
        $scope.personal.investmentAssets    = $scope.personal.investmentAssets === undefined    ? 0 : $scope.personal.investmentAssets;
        $scope.personal.debtRepayment       = $scope.personal.debtRepayment === undefined       ? 0 : $scope.personal.debtRepayment;
        $scope.personal.income              = $scope.personal.income === undefined              ? 0 : $scope.personal.income;
        $scope.personal.expenditure         = $scope.personal.expenditure === undefined         ? 0 : $scope.personal.expenditure;
        $scope.personal.savings             = $scope.personal.savings === undefined             ? 0 : $scope.personal.savings;
        $scope.personal.expenditure         = $scope.personal.expenditure === undefined         ? 0 : $scope.personal.expenditure;
        $scope.personal.otherInflow         = $scope.personal.otherInflow === undefined         ? 0 : $scope.personal.otherInflow;
        //CALCULATE TOTAL
        $scope.personal.totalAssets = 0;
        $scope.personal.totalLiabilities = 0;
        $scope.personal.cashInflow = $scope.personal.income + $scope.personal.otherInflow;

        if (($scope.credential === "advisor" && $scope.clientSelected) || $scope.credential === "client") {
            //ASSETS
            $scope.assetsObj = assets_g;
            angular.forEach($scope.assetsObj, function(asset,index){
                asset.amt = $scope.personal[asset.varName] === undefined ? 0 : $scope.personal[asset.varName];
                $scope.personal.totalAssets += asset.amt;
            });
            angular.forEach($scope.assetsObj, function(asset,index){
                asset.percent = (asset.amt / $scope.personal.totalAssets * 100).toFixed(0);
            });
            //LIABILITIES
            $scope.liabilitiesObj = liabilities_g;
            angular.forEach($scope.liabilitiesObj, function(liability,index) {
                liability.amt = $scope.personal[liability.varName] === undefined ? 0 : $scope.personal[liability.varName];
                $scope.personal.totalLiabilities += liability.amt;
            });
            angular.forEach($scope.liabilitiesObj, function(liability,index) {
                liability.percent = (liability.amt / $scope.personal.totalLiabilities * 100).toFixed(0);
            });
            //NET WORTH
            $scope.personal.netWorth = $scope.personal.totalAssets - $scope.personal.totalLiabilities;


            $timeout(function(){
                var assetWidth = window_width_g - 16;
                //var assetHeaderRatio = 3.66/26.35;
                //var assetCellRatio   = 7.25/26.35;
                var assetHeaderRatio = 3.46/26.35;
                var assetCellRatio   = 7.15/26.35;
                $("#assetTable thead tr").height(assetWidth * assetHeaderRatio);
                $("#assetTable tbody tr").height(assetWidth * assetCellRatio);
                $("#liabilityTable thead tr").height(assetWidth * assetHeaderRatio);
                $("#liabilityTable tbody tr").height(assetWidth * assetCellRatio);
            },1);

            //FINANCIAL RATIO
            $scope.ratios = angular.copy(financial_ratio_g);
            angular.forEach($scope.ratios, function(ratio,index){
                //CALULATE CLIENT'S RATIO
                if ($scope.personal[ratio.denominator] === 0) {
                    ratio.amt = 0;
                } else {
                    if (ratio.title === "LIQUIDITY_RATIO") {
                        ratio.amt = ($scope.personal[ratio.numerator] / $scope.personal[ratio.denominator] / 12 * 100).toFixed(0);
                    } else {
                        ratio.amt = ($scope.personal[ratio.numerator] / $scope.personal[ratio.denominator] * 100).toFixed(0);
                    }
                }

                //GENERATE SUGGEST AND STATUS
                var suffix = ratio.title === "LIQUIDITY_RATIO" ? " mths" : "%";
                ratio.amt = parseInt(ratio.amt);
                if (ratio.lower !== undefined && ratio.upper !== undefined) {
                    ratio.suggest = ratio.lower + suffix + " - " + ratio.upper + suffix;
                    if (ratio.amt > ratio.lower && ratio.amt < ratio.upper) {
                        ratio.pass = true;
                        ratio.status = $translate.instant("FINANCIAL_RATIO_PASS");
                    } else {
                        ratio.pass = false;
                        ratio.status = ratio.amt > ratio.upper ? $translate.instant("FINANCIAL_RATIO_EXCESS") : $translate.instant("FINANCIAL_RATIO_SHORTFALL");
                    }
                } else {
                    if (ratio.lower === undefined) {
                        ratio.suggest = "< " + ratio.upper + suffix;
                        ratio.pass = ratio.amt < ratio.upper ? true : false;
                        ratio.status = ratio.amt < ratio.upper ? $translate.instant("FINANCIAL_RATIO_PASS") : $translate.instant("FINANCIAL_RATIO_EXCESS");
                    } else {
                        ratio.suggest = "> " + ratio.lower + suffix;
                        ratio.pass = ratio.amt > ratio.lower ? true : false;
                        ratio.status = ratio.amt > ratio.lower ? $translate.instant("FINANCIAL_RATIO_PASS") : $translate.instant("FINANCIAL_RATIO_SHORTFALL");
                    }
                }
                ratio.amt = ratio.amt + suffix;
            });
        }



    };
});

