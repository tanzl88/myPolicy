app.controller('AddPolicyCtrl', ['$rootScope', '$scope', '$timeout', '$state', '$translate', '$http', '$timeout', '$toast', 'loadingService', 'utilityService', '$ionicNavBarDelegate', '$ionicHistory', '$ionicScrollDelegate', 'errorHandler', function($rootScope,$scope,$timeout,$state,$translate,$http,$timeout,$toast,loadingService,utilityService,
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
    function getModeEnum(mode) {
        if (mode === "planType") {
            return plan_type_enum_g;
        } else if (mode === "premiumMode") {
            return premium_mode_enum_g;
        } else if (mode === "paymentMode") {
            return payment_mode_enum_g;
        } else {
            return undefined;
        }
    }
    function getDefaultMode(mode) {
        if (mode === "premiumMode") {
            return 2;
        } else {
            return -1;
        }
    }
    $scope.changeMode = function(mode) {
        var enum_g = getModeEnum(mode);
        var currentModeIndex = validity_test($scope.policyObj[mode]) ? parseInt($scope.policyObj[mode]) : getDefaultMode(mode);
        var nextModeIndex = (currentModeIndex + 1) % enum_g.length;
        $scope.updateMode(mode,nextModeIndex);
    };
    $scope.updateMode = function(mode,index) {
        var enum_g = getModeEnum(mode);
        $scope.policyObj[mode] = index;
        $scope.policyObj[mode + "Displayed"] = enum_g[index];
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
                payoutTerm              : undefined,
                payoutTermMode          : undefined,
                payoutTermDisplayed     : undefined,
                deathSA                 : undefined,
                tpdSA                   : undefined,
                disabledSA              : undefined,
                critSA                  : undefined,
                terminalSA              : undefined,
                earlySA                 : undefined,
                hospitalSA              : undefined,
                hospitalIncome          : undefined,
                accidentDeath           : undefined,
                accidentReimb           : undefined,
                retireIncome            : undefined,
                currentCash             : undefined,
                surrenderCash           : undefined,
                payoutTerm              : undefined,
                beneficiary             : undefined,
                remarks                 : undefined
            };
        }

        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('policyForm').scrollTop();
        //RESTORE PRISTINE
        //utilityService.resetForm
        $("#policyForm").scope().policyForm.$setPristine();
    };

    // -------------------- VALIDATION --------------------
    $scope.submitButton = function() {
        $timeout(function(){
            $("#addPolicySubmit").click();
        },1);
    };
    $scope.submit = function(policyForm) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('Core', 'Policy', 'Add / Edit');

        //HIDE KEYBOARD UPON SUBMIT
        var delay_time = utilityService.getKeyboardDelay();
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
                if (input.payoutTermMode !== undefined)   input.payoutTermMode   = booleanToInt(input.payoutTermMode);

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


}]);

