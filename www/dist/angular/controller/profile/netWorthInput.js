app.controller('netWorthInputCtrl', ['$scope', '$state', '$http', '$translate', '$toast', '$timeout', '$ionicHistory', '$ionicScrollDelegate', 'personalDataDbService', 'loadingService', 'credentialManager', 'errorHandler', function($scope,$state,$http,$translate,$toast,$timeout,$ionicHistory,$ionicScrollDelegate,
                                       personalDataDbService,loadingService,credentialManager,errorHandler) {
    $scope.initVar = function() {
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();
        $scope.currency = $translate.instant("CURRENCY");
        $scope.personal = angular.copy(personalDataDbService.getData());

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

    //-------------------- SUBMIT --------------------
    $scope.submitButton = function() {
        $timeout(function() {
            $("#netWorthSubmit").click();
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
