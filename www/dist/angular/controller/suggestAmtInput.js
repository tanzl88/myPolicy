app.controller('SuggestAmtInputCtrl', ['$scope', '$state', '$http', '$translate', '$toast', '$timeout', '$ionicHistory', '$ionicScrollDelegate', '$cordovaEmailComposer', 'personalDataDbService', 'loadingService', 'credentialManager', function($scope,$state,$http,$translate,$toast,$timeout,$ionicHistory,$ionicScrollDelegate,$cordovaEmailComposer,
                                       personalDataDbService,loadingService,credentialManager) {
    $scope.initVar = function() {
        $scope.credential       = credentialManager.getCredential();
        $scope.clientSelected   = credentialManager.getClientSelected();
        $scope.readOnly         = $scope.credential === "advisor" ? false : true;
        if ($scope.credential === "advisor" && !$scope.clientSelected) {
            //$toast.showClientNotSelected();
        } else {
            if (!personalDataDbService.profileFound() && $scope.credential === "client") {
                $state.go("tabs.profile.editProfile");
            }
        }

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
    $scope.editProfile = function() {
        $state.go("tabs.profile.editProfile");
    };
    $scope.goToProfile = function() {
        $ionicHistory.goBack();
    };
    $scope.goToCaseNotes = function() {
        $state.go("tabs.profile.caseNotes");
    };

    // --------------- CONTACT ADVISOR MENU (IF LINKED) ---------------
    var originatorEv;
    $scope.toggleMenu = function() {
        $timeout(function(){
            $("#contactClientMenuTrigger").click();
        },1);
    };
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    // --------------- CONTACT CLIENT ---------------
    $scope.call = function() {
        if (validity_test($scope.personal.phone)) {
            document.location.href = 'tel:'  + $scope.personal.phone;
        } else {
            $toast.show("NO_CLIENT_PHONE")
        }
    };
    $scope.email = function() {
        if (validity_test($scope.personal.email)) {
            var email = {
                to     : $scope.personal.email,
                isHtml : true
            };
            $cordovaEmailComposer.open(email).then(null, function () {
                // user cancelled email
            });
        } else {
            $toast.show("NO_CLIENT_EMAIL")
        }
    };

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
    $scope.changeGender = function() {
        if ($scope.credential === "advisor") {
            $scope.personal.gender = $scope.personal.gender === undefined ? 1 : ($scope.personal.gender + 1)%gender_enum_g.length;
            $scope.personal.genderDisplayed = gender_enum_g[$scope.personal.gender];
        }
    };
    $scope.changeSmoker = function() {
        if ($scope.credential === "advisor") {
            $scope.personal.smoker = $scope.personal.smoker === undefined ? 1 : ($scope.personal.smoker + 1)%smoker_enum_g.length;
            $scope.personal.smokerDisplayed = smoker_enum_g[$scope.personal.smoker];
        }
    };
    $scope.changeUseAdvanced = function() {
        if ($scope.credential === "advisor") {
            $scope.personal.useAdvanced = $scope.personal.useAdvanced === undefined ? 1 : ($scope.personal.useAdvanced + 1)%advanced_enum_g.length;
            $scope.personal.useAdvancedDisplayed = advanced_enum_g[$scope.personal.useAdvanced];
            $ionicScrollDelegate.$getByHandle('clientProfileScroll').scrollTop(true);
        }
    };

    //-------------------- RATE --------------------
    $scope.changeDifferentiateRate = function() {
        if ($scope.credential === "advisor") {
            $scope.personal.differentiateRate = $scope.personal.differentiateRate === undefined ? 1 : ($scope.personal.differentiateRate + 1) % differentiate_rate_enum_g.length;
            $scope.updateDifferentiateRate($scope.personal.differentiateRate);
        }
    };
    $scope.updateDifferentiateRate = function(index) {
        if ($scope.credential === "advisor") {
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
            phone                   : $scope.personal.phone,
            email                   : $scope.personal.email,
            interest                : $scope.personal.interest
        };
        console.log(input);
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
                        $scope.initVar();

                        loadingService.hide();
                    });
                } else {
                    errorHandler.handleOthers(result.status);
                }
            });
    };
}]);
