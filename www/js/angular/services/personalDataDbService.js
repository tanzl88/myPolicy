app.service('personalDataDbService', function($rootScope,$q,$http,$translate) {
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
                treatmentCost               : parseDbInt(personalSettingsArray.treatmentCost),
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
                //otherInflow                 : parseDbInt(personalSettingsArray.otherInflow),
                debtRepayment               : parseDbInt(personalSettingsArray.debtRepayment),
                //savings                     : parseDbInt(personalSettingsArray.savings),
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
            if (personal_g === undefined) {
                return undefined;
            } else {
                return personal_g[colName];
            }
        },
        profileFound : function() {
            return profile_found_g;
        },
        getUserId : function() {
            return personal_g.id;
        }
    }
});