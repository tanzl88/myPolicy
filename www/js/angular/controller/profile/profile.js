app.controller('ProfileCtrl', function($scope,$state,$http,$translate,$toast,$timeout,$ionicHistory,$ionicScrollDelegate,$cordovaEmailComposer,
                                       personalDataDbService,loadingService,credentialManager,errorHandler) {
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
    $scope.goTo = function(state) {
        $state.go("tabs.profile." + state);
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

    //-------------------- SUBMIT --------------------
    $scope.submitButton = function() {
        $timeout(function() {
            $("#clientProfileSubmit").click();
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
            //otherInflow             : parseInt($scope.personal.otherInflow),
            debtRepayment           : parseInt($scope.personal.debtRepayment),
            //savings                 : parseInt($scope.personal.savings),
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
});
