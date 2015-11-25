app.service('personalDataDbService', ['$rootScope', '$q', '$http', '$translate', function($rootScope,$q,$http,$translate) {
    var personal_g;
    var profile_found_g = false;
    $rootScope.$on("LOGOUT", function(){
        personal_g = undefined;
        profile_found_g = false;
    });

    function parseDate(dateString) {
        if (!validity_test(dateString) || dateString === "0000-00-00") {
            return undefined;
        } else {
            return moment(dateString,"YYYY-MM-DD").format("LL");
        }
    }
    function parseDbInt(input) {
        if (!validity_test(input)) {
            return undefined;
        } else {
            return parseInt(input);
        }
    }
    function parseDbFloat(input) {
        if (!validity_test(input)) {
            return undefined;
        } else {
            return parseFloat(input);
        }
    }
    function parseDbBoolean(input) {
        if (input === "0") {
            return false;
        } else if (input === "1") {
            return true;
        } else {
            return undefined;
        }
    }


    return {
        init : function() {
            var thisService = this;
            var dfd = $q.defer();
            $http.get(ctrl_url + "get_personal_settings" + "?decache=" + Date.now())
                .success(function(personalSettings){
                    personal_g = thisService.processPersonalArray(personalSettings);
                    dfd.resolve("OK");
                });

            return dfd.promise;
        },
        set : function(array) {
            personal_g = this.processPersonalArray(array);
        },
        processPersonalArray : function(personalSettingsArray) {
            profile_found_g = (validity_test(parseDbInt(personalSettingsArray.gender))) ? true : false;
            personalSettingsArray.useAdvanced = validity_test(personalSettingsArray.useAdvanced) ? parseDbInt(personalSettingsArray.useAdvanced) : 0;
            var birthday = parseDate(personalSettingsArray.birthday);
            var year     = validity_test(birthday) ? moment(birthday,"LL").year() : undefined;
            var month    = validity_test(birthday) ? moment(birthday,"LL").month() + 1 : undefined;
            var day      = validity_test(birthday) ? moment(birthday,"LL").date() : undefined;

            var output = {
                id                          : personalSettingsArray.id,
                name                        : personalSettingsArray.name,
                gender                      : parseDbInt(personalSettingsArray.gender),
                genderDisplayed             : gender_enum_g[parseDbInt(personalSettingsArray.gender)],
                smoker                      : parseDbInt(personalSettingsArray.smoker),
                smokerDisplayed             : smoker_enum_g[parseDbInt(personalSettingsArray.smoker)],
                income                      : parseDbInt(personalSettingsArray.income),
                expenditure                 : parseDbInt(personalSettingsArray.expenditure),
                useAdvanced                 : personalSettingsArray.useAdvanced,
                useAdvancedDisplayed        : advanced_enum_g[parseDbInt(personalSettingsArray.useAdvanced)],
                differentiateRate           : personalSettingsArray.differentiateRate,
                differentiateRateDisplayed  : differentiate_rate_enum_g[parseDbInt(personalSettingsArray.differentiateRate)],
                shortTermRateOfReturn       : parseDbFloat(personalSettingsArray.shortTermRateOfReturn),
                shortTermInflation          : parseDbFloat(personalSettingsArray.shortTermInflation),
                longTermRateOfReturn        : parseDbFloat(personalSettingsArray.longTermRateOfReturn),
                longTermInflation           : parseDbFloat(personalSettingsArray.longTermInflation),
                immediateCash               : parseDbInt(personalSettingsArray.immediateCash),
                dependencyYears             : parseDbInt(personalSettingsArray.dependencyYears),
                dependencyIncome            : parseDbInt(personalSettingsArray.dependencyIncome),
                personalYears               : parseDbInt(personalSettingsArray.personalYears),
                personalIncome              : parseDbInt(personalSettingsArray.personalIncome),
                cashAssets                  : parseDbInt(personalSettingsArray.cashAssets),
                pension                     : parseDbInt(personalSettingsArray.pension),
                investmentAssets            : parseDbInt(personalSettingsArray.investmentAssets),
                houseValue                  : parseDbInt(personalSettingsArray.houseValue),
                carValue                    : parseDbInt(personalSettingsArray.carValue),
                otherAssets                 : parseDbInt(personalSettingsArray.otherAssets),
                mortgage                    : parseDbInt(personalSettingsArray.mortgage),
                autoLoans                   : parseDbInt(personalSettingsArray.autoLoans),
                studyLoans                  : parseDbInt(personalSettingsArray.studyLoans),
                otherLiabilities            : parseDbInt(personalSettingsArray.otherLiabilities),
                otherInflow                 : parseDbInt(personalSettingsArray.otherInflow),
                debtRepayment               : parseDbInt(personalSettingsArray.debtRepayment),
                savings                     : parseDbInt(personalSettingsArray.savings),
                phone                       : personalSettingsArray.phone,
                email                       : personalSettingsArray.email,
                interest                    : personalSettingsArray.interest,
                birthday                    : birthday,
                year                        : year,
                month                       : month,
                day                         : day
            };

            return output;
        },
        getData : function() {
            if (personal_g === undefined || personal_g.length === 0) {
                var temp = {
                    income : 0,
                    expenditure : 0
                };
                return temp;
            } else {
                return personal_g;
            }
        },
        getUserData : function(colName) {
            return personal_g[colName];
        },
        profileFound : function() {
            return profile_found_g;
        },
        getUserId : function() {
            return personal_g.id;
        },
        getNetWorthData : function() {
            var personalObj = {};
            personalObj.personal = angular.copy(this.getData());
            //NULLIFY MISSING VARIABLES
            personalObj.personal.cashAssets          = personalObj.personal.cashAssets === undefined          ? 0 : personalObj.personal.cashAssets;
            personalObj.personal.investmentAssets    = personalObj.personal.investmentAssets === undefined    ? 0 : personalObj.personal.investmentAssets;
            personalObj.personal.debtRepayment       = personalObj.personal.debtRepayment === undefined       ? 0 : personalObj.personal.debtRepayment;
            personalObj.personal.income              = personalObj.personal.income === undefined              ? 0 : personalObj.personal.income;
            personalObj.personal.expenditure         = personalObj.personal.expenditure === undefined         ? 0 : personalObj.personal.expenditure;
            personalObj.personal.savings             = personalObj.personal.savings === undefined             ? 0 : personalObj.personal.savings;
            personalObj.personal.otherInflow         = personalObj.personal.otherInflow === undefined         ? 0 : personalObj.personal.otherInflow;
            //CALCULATE TOTAL
            personalObj.personal.totalAssets         = 0;
            personalObj.personal.totalLiabilities    = 0;
            personalObj.personal.cashInflow          = personalObj.personal.income + personalObj.personal.otherInflow;
            personalObj.personal.expenses            = personalObj.personal.expenditure - personalObj.personal.debtRepayment;
            personalObj.personal.cashOutflow         = personalObj.personal.expenditure + personalObj.personal.savings;
            personalObj.personal.netCashflow         = personalObj.personal.cashInflow - personalObj.personal.cashOutflow;

            //ASSETS
            personalObj.assetsObj = assets_g;
            angular.forEach(personalObj.assetsObj, function(asset,index){
                asset.amt = personalObj.personal[asset.varName] === undefined ? 0 : personalObj.personal[asset.varName];
                personalObj.personal.totalAssets += asset.amt;
            });
            angular.forEach(personalObj.assetsObj, function(asset,index){
                asset.percent = personalObj.personal.totalAssets === 0 ? 0 : (asset.amt / personalObj.personal.totalAssets * 100).toFixed(0);
            });
            //LIABILITIES
            personalObj.liabilitiesObj = liabilities_g;
            angular.forEach(personalObj.liabilitiesObj, function(liability,index) {
                liability.amt = personalObj.personal[liability.varName] === undefined ? 0 : personalObj.personal[liability.varName];
                personalObj.personal.totalLiabilities += liability.amt;
            });
            angular.forEach(personalObj.liabilitiesObj, function(liability,index) {
                liability.percent = personalObj.personal.totalLiabilities === 0 ? 0 : (liability.amt / personalObj.personal.totalLiabilities * 100).toFixed(0);
            });
            //NET WORTH
            personalObj.personal.netWorth = personalObj.personal.totalAssets - personalObj.personal.totalLiabilities;


            //FINANCIAL RATIO
            personalObj.ratios = angular.copy(financial_ratio_g);
            angular.forEach(personalObj.ratios, function(ratio,index){
                //CALCULATE CLIENT'S RATIO
                if (personalObj.personal[ratio.denominator] === 0) {
                    ratio.amt = 0;
                } else {
                    if (ratio.title === "LIQUIDITY_RATIO") {
                        ratio.amt = (personalObj.personal[ratio.numerator] / personalObj.personal[ratio.denominator] / 12 * 100).toFixed(0);
                    } else {
                        ratio.amt = (personalObj.personal[ratio.numerator] / personalObj.personal[ratio.denominator] * 100).toFixed(0);
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

            return personalObj;
        }
    }
}]);