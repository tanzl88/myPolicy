app.controller('AddPolicyCtrl', function($rootScope,$scope,$timeout,$state,$translate,$http,$toast,loadingService,$cordovaKeyboard,
                                         $ionicNavBarDelegate,$ionicHistory,$ionicScrollDelegate,errorHandler) {
    $scope.company_enum = company_enum_g;
    $scope.plan_type_enum = plan_type_enum_g;
    $scope.premium_mode_enum = premium_mode_enum_g;

    // -------------------- UTILITY --------------------
    $scope.goToNext = function(event) {
        if (event.which === 13) {
            event.preventDefault();
            var parentEl = event.currentTarget.parentElement;
            var siblingEl = parentEl.nextElementSibling;
            var inputEl = $(siblingEl).find("input");
            if (inputEl.length > 0) {
                if ($(inputEl).hasClass("datepicker")) {
                    $timeout(function(){
                        angular.element(inputEl).trigger('click');
                    },100);
                } else {
                    $timeout(function(){
                        $(inputEl).focus();
                    },100);

                }
            }
        }
    };
    $scope.formatter = function(modelValue, filter, decimal) {
        decimal = validity_test(decimal) ? decimal : 0;
        if (modelValue) {
            var currencyUnit = $translate.instant("CURRENCY");
            return filter("currency")(modelValue,currencyUnit,decimal);
        }
        return "";
    };

    // -------------------- INPUT FUNCTION --------------------
    $scope.changePlanType = function() {
        var currentTypeIndex = validity_test($scope.policyObj.planType) ? parseInt($scope.policyObj.planType) : -1;
        var nextTypeIndex = (currentTypeIndex + 1) % plan_type_enum_g.length;
        $scope.updatePlanType(nextTypeIndex);
    };
    $scope.updatePlanType = function(index) {
        $scope.policyObj.planType = index;
        $scope.policyObj.planTypeDisplayed = plan_type_enum_g[index];
    };
    $scope.changePremiumMode = function() {
        var currentModeIndex = validity_test($scope.policyObj.premiumMode) ? parseInt($scope.policyObj.premiumMode) : 2;
        var nextModeIndex = (currentModeIndex + 1) % premium_mode_enum_g.length;
        $scope.updatePremiumMode(nextModeIndex);
    };
    $scope.updatePremiumMode = function(index) {
        $scope.policyObj.premiumMode = index;
        $scope.policyObj.premiumModeDisplayed = premium_mode_enum_g[index];
    };
    $scope.changePaymentMode = function() {
        var currentModeIndex = validity_test($scope.policyObj.paymentMode) ? parseInt($scope.policyObj.paymentMode) : -1;
        var nextModeIndex = (currentModeIndex + 1) % payment_mode_enum_g.length;
        $scope.updatePaymentMode(nextModeIndex);
    };
    $scope.updatePaymentMode = function(index) {
        $scope.policyObj.paymentMode = index;
        $scope.policyObj.paymentModeDisplayed = payment_mode_enum_g[index];
    };
    $scope.selectAll = function(event) {
        var target = event.currentTarget;
        target.setSelectionRange(0, target.value.length);
    };


    // -------------------- INIT VAR --------------------
    $scope.initVar = function() {
        var mode = $rootScope.mode;
        delete $rootScope.mode;
        if (mode === 'edit') {
            $ionicNavBarDelegate.title($translate.instant("EDIT_POLICY"));
            $scope.policyObj = angular.copy($rootScope.policyObj);
            delete $rootScope.policyObj;
        } else {
            $ionicNavBarDelegate.title($translate.instant("ADD_POLICY"));
            $scope.policyObj = {
                id                      : undefined,
                policyNumber            : undefined,
                company                 : undefined,
                planType                : undefined,
                planName                : undefined,
                startDate               : undefined,
                maturityDate            : undefined,
                premium                 : undefined,
                premiumMode             : undefined,
                premiumModeDisplayed    : undefined,
                paymentMode             : undefined,
                paymentModeDisplayed    : undefined,
                premiumTerm             : undefined,
                premiumTermMode         : undefined,
                premiumTermDisplayed    : undefined,
                coverageTerm            : undefined,
                coverageTermMode        : undefined,
                coverageTermDisplayed   : undefined,
                //sumAssured              : undefined,
                deathSA                 : undefined,
                tpdSA                   : undefined,
                disabledSA              : undefined,
                critSA                  : undefined,
                earlySA                 : undefined,
                hospitalSA              : undefined,
                hospitalIncome          : undefined,
                accidentDeath           : undefined,
                accidentReimb           : undefined,
                currentCash             : undefined,
                surrenderCash           : undefined,
                remarks                 : undefined
            };
        }

        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('policyForm').scrollTop();
        //RESTORE PRISTINE
        $("#policyForm").scope().policyForm.$setPristine();
    };

    // -------------------- VALIDATION --------------------
    $scope.submit = function(policyForm) {
        var delay_time = 0;
        if (isMobile() && $cordovaKeyboard.isVisible()) {
            $cordovaKeyboard.close();
            delay_time = 400;
        }

        $timeout(function(){
            if (policyForm.$invalid) {
                policyForm.company.$setDirty();
                $ionicScrollDelegate.$getByHandle('policyForm').scrollTop(true);
                $toast.show("COMPANY_ERROR");
            } else {
                loadingService.show("SUBMITTING");
                var input = {};
                for (var key in $scope.policyObj) {
                    if (validity_test($scope.policyObj[key])) input[key] = $scope.policyObj[key];
                    if ($scope.policyObj[key] == "NaN") delete input[key];
                }
                //CONVERT DATE
                if (input.startDate)    input.startDate     = moment(input.startDate,"LL").toDate();
                if (input.maturityDate) input.maturityDate  = moment(input.maturityDate,"LL").toDate();
                //CONVERT BOOLEAN
                if (input.premiumTermMode  !== undefined) input.premiumTermMode  = booleanToInt(input.premiumTermMode);
                if (input.coverageTermMode !== undefined) input.coverageTermMode = booleanToInt(input.coverageTermMode);
                console.log(input);
                $http.post(ctrl_url + "set_policy", input)
                    .success(function(result){
                        if (result.status === "success") {
                            //IF INSERT, RELOAD POLICY DATA
                            if (input.id === undefined) {
                                $scope.policyObj.id = result.data;
                                $("#list_view").scope().insertPolicy($scope.policyObj);
                            } else {
                                $("#list_view").scope().updatePolicy($scope.policyObj);
                            }
                            loadingService.hide();
                            $ionicHistory.goBack();
                        } else {
                            errorHandler.handleOthers(result.status);
                        }
                    });
            }
        },delay_time);
    };


});

