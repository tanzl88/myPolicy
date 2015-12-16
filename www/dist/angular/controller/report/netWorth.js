app.controller('NetWorthCtrl', ['$scope', '$translate', '$timeout', '$interval', '$toast', '$state', '$ionicScrollDelegate', 'credentialManager', 'policyDataService', 'policyDataDbService', 'personalDataDbService', 'barChartService', 'lineChartService', function($scope,$translate,$timeout,$interval,$toast,$state,$ionicScrollDelegate,credentialManager,
                                        policyDataService,policyDataDbService,personalDataDbService,barChartService,lineChartService) {

    $scope.initVar = function() {
        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('report').scrollTop();

        //CHECK CLIENT SELECTED
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();

        if (($scope.credential === "advisor" && $scope.clientSelected) || $scope.credential === "client") {
            $scope.personal = angular.copy(policyDataService.getNetWorthData());

            $timeout(function(){
                var assetWidth = window_width_g - 16;
                var assetHeaderRatio = 3.46/26.35;
                var assetCellRatio   = 6.15/26.35;
                var cashflowContentRatio = 2.18/17.64;
                var cashflowEmptyRatio = 8.21/17.64;
                $("#assetTable thead tr").height(assetWidth * assetHeaderRatio);
                $("#assetTable tbody tr").height(assetWidth * assetCellRatio);
                $("#liabilityTable thead tr").height(assetWidth * assetHeaderRatio);
                $("#liabilityTable tbody tr").height(assetWidth * assetCellRatio);
                $("#cashflowTable tr.content").height(assetWidth * cashflowContentRatio);
                $("#cashflowTable tr.empty").height(assetWidth * cashflowEmptyRatio);
                $("#cashflowTable tr.large_empty").height(assetWidth * cashflowEmptyRatio * 1.85);
            },1);


        }



    };
}]);

