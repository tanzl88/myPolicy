app.controller('SuggestAmtInputCtrl', ['$scope', '$state', '$http', '$translate', '$toast', '$timeout', '$ionicHistory', '$ionicScrollDelegate', 'personalDataDbService', 'loadingService', 'credentialManager', 'errorHandler', function($scope,$state,$http,$translate,$toast,$timeout,$ionicHistory,$ionicScrollDelegate,
                                       personalDataDbService,loadingService,credentialManager,errorHandler) {
    $scope.initVar = function() {
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();
        $scope.currency = $translate.instant("CURRENCY");
        $scope.personal = angular.copy(personalDataDbService.getData());
        $scope.personal.differentiateRate = $scope.personal.differentiateRate === undefined ? 0 : $scope.personal.differentiateRate % differentiate_rate_enum_g.length;
        $scope.updateDifferentiateRate($scope.personal.differentiateRate);

        //DEFAULT RATE
        $scope.personal.shortTermRateOfReturn   = $scope.personal.shortTermRateOfReturn === undefined   ? 0.3 : $scope.personal.shortTermRateOfReturn;
        $scope.personal.shortTermInflation      = $scope.personal.shortTermInflation === undefined      ? 2.0 : $scope.personal.shortTermInflation;
        $scope.personal.longTermRateOfReturn    = $scope.personal.longTermRateOfReturn === undefined    ? 2.7 : $scope.personal.longTermRateOfReturn;
        $scope.personal.longTermInflation       = $scope.personal.longTermInflation === undefined       ? 1.8 : $scope.personal.longTermInflation;
        $scope.calcShortTermAdjustedRate();
        $scope.calcLongTermAdjustedRate();
    };
    $scope.$on('CLIENTS PROFILE UPDATED',function(){
        $scope.personal = personalDataDbService.getData();
    });

    //-------------------- FORMATTER --------------------
    $scope.formatter = function(modelValue, filter, decimal) {
        decimal = validity_test(decimal) ? decimal : 0;
        if (modelValue || modelValue === 0) {
            var currencyUnit = $translate.instant("CURRENCY");
            return filter("currency")(modelValue,currencyUnit,decimal);
        }
        return "";
    };
    $scope.Percentformatter = function(modelValue, filter, decimal) {
        decimal = validity_test(decimal) ? decimal : 1;
        if (modelValue || modelValue === 0) {
            return filter('number')(modelValue, decimal) + '%';
        }
        return "";
    };

    //-------------------- TOGGLE --------------------
    $scope.changeUseAdvanced = function() {
        $scope.personal.useAdvanced = $scope.personal.useAdvanced === undefined ? 1 : ($scope.personal.useAdvanced + 1)%advanced_enum_g.length;
        $scope.personal.useAdvancedDisplayed = advanced_enum_g[$scope.personal.useAdvanced];
        $ionicScrollDelegate.$getByHandle('suggestAmtScroll').scrollTop(true);
    };

    //-------------------- RATE --------------------
    $scope.changeDifferentiateRate = function() {
        $scope.personal.differentiateRate = $scope.personal.differentiateRate === undefined ? 1 : ($scope.personal.differentiateRate + 1) % differentiate_rate_enum_g.length;
        $scope.updateDifferentiateRate($scope.personal.differentiateRate);
    };
    $scope.updateDifferentiateRate = function(index) {
        $scope.personal.differentiateRateDisplayed = differentiate_rate_enum_g[index];
        if (index === 1) {
            $scope.longTermRateOfReturn = "LONG_TERM_RATE_OF_RETURN";
            $scope.longTermInflationLabel = "LONG_TERM_INFLATION";
            $scope.adjustedLongTermRateLabel = "LONG_TERM_INFLATION_ADJUSTED_RATE_OF_RETURN";
        } else {
            $scope.longTermRateOfReturn = "RATE_OF_RETURN";
            $scope.longTermInflationLabel = "INFLATION_RATE";
            $scope.adjustedLongTermRateLabel = "INFLATION_ADJUSTED_RATE_OF_RETURN";
        }
    };
    function calcAdjustedRate(rateOfReturn,inflationRate) {
        var adjustedRate = ((rateOfReturn / 100 - inflationRate / 100) / (1 + inflationRate / 100) * 100);
        return adjustedRate;
    }
    $scope.calcShortTermAdjustedRate = function() {
        var adjustedRate = calcAdjustedRate($scope.personal.shortTermRateOfReturn,$scope.personal.shortTermInflation);
        $scope.personal.shortTermAdjustedRate = isNaN(adjustedRate) ? undefined : parseFloat(adjustedRate.toFixed(1)) + "%";
    };
    $scope.calcLongTermAdjustedRate = function() {
        var adjustedRate = calcAdjustedRate($scope.personal.longTermRateOfReturn,$scope.personal.longTermInflation);
        $scope.personal.longTermAdjustedRate = isNaN(adjustedRate) ? undefined : parseFloat(adjustedRate.toFixed(1)) + "%";
    };

    //-------------------- SUBMIT --------------------
    $scope.submitButton = function() {
        $timeout(function() {
            $("#suggestAmtSubmit").click();
        });
    };
    $scope.submit = function() {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('Core', "Client's profile", 'Advisor Add / Advisor Edit');

        loadingService.show("SUBMITTING");

        var input = {
            id                      : $scope.personal.id,
            name                    : $scope.personal.name,
            birthday                : $scope.personal.birthday,
            gender                  : $scope.personal.gender,
            smoker                  : $scope.personal.smoker,
            income                  : parseInt($scope.personal.income),
            expenditure             : parseInt($scope.personal.expenditure),
            useAdvanced             : parseInt($scope.personal.useAdvanced),
            differentiateRate       : parseInt($scope.personal.differentiateRate),
            shortTermRateOfReturn   : parseFloat($scope.personal.shortTermRateOfReturn),
            shortTermInflation      : parseFloat($scope.personal.shortTermInflation),
            longTermRateOfReturn    : parseFloat($scope.personal.longTermRateOfReturn),
            longTermInflation       : parseFloat($scope.personal.longTermInflation),
            immediateCash           : parseInt($scope.personal.immediateCash),
            dependencyYears         : parseInt($scope.personal.dependencyYears),
            dependencyIncome        : parseInt($scope.personal.dependencyIncome),
            personalYears           : parseInt($scope.personal.personalYears),
            personalIncome          : parseInt($scope.personal.personalIncome),
            cashAssets              : parseInt($scope.personal.cashAssets),
            pension                 : parseInt($scope.personal.pension),
            investmentAssets        : parseInt($scope.personal.investmentAssets),
            houseValue              : parseInt($scope.personal.houseValue),
            carValue                : parseInt($scope.personal.carValue),
            otherAssets             : parseInt($scope.personal.otherAssets),
            mortgage                : parseInt($scope.personal.mortgage),
            autoLoans               : parseInt($scope.personal.autoLoans),
            studyLoans              : parseInt($scope.personal.studyLoans),
            otherLiabilities        : parseInt($scope.personal.otherLiabilities),
            otherInflow             : parseInt($scope.personal.otherInflow),
            debtRepayment           : parseInt($scope.personal.debtRepayment),
            savings                 : parseInt($scope.personal.savings),
            phone                   : $scope.personal.phone,
            email                   : $scope.personal.email,
            interest                : $scope.personal.interest
        };
        for (var key in input) {
            if (key === "id" && input[key] === undefined) {
                delete input[key];
            } else if (isNaN_test(input[key])) {
                delete input[key];
                //input[key] = 0;
            }
        }

        $http.post(ctrl_url + "set_personal_settings", input)
            .success(function(result){
                if (result.status === "success") {
                    $toast.show("CLIENT_PROFILE_UPDATED");
                    personalDataDbService.init().then(function(result){
                        $ionicHistory.goBack();
                        loadingService.hide();
                    });
                } else {
                    errorHandler.handleOthers(result.status);
                }
            });
    };
}]);
