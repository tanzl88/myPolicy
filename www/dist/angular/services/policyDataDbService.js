app.service('policyDataDbService', ['$rootScope', '$q', '$http', '$translate', 'personalDataDbService', function($rootScope,$q,$http,$translate,personalDataDbService) {
    var policies_g;
    $rootScope.$on("LOGOUT", function(){
        policies_g = [];
    });

    var allSum = [
        "deathSA",
        "tpdSA",
        "critSA",
        "earlySA",
        "terminalSA",
        "disabledSA",
        "hospitalSA",
        "hospitalIncome",
        "accidentDeath",
        "accidentReimb",
        "retireIncome",
        "currentValue",
        "surrenderValue"
    ];


    function parseDate(dateString) {
        if (!validity_test(dateString) || dateString === "0000-00-00") {
            return undefined;
        } else {
            return moment(dateString,"YYYY-MM-DD").format("LL")
        }
    }
    function parseUndefinedToZero(input) {
        if (input === undefined) {
            return 0;
        } else {
            return input;
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
    function getTermDisplayed(mode,year) {
        if (mode === "0") {
            return $translate.instant("YEAR_OLD",{
                year : year
            },'messageformat');
        } else if (mode === "1") {
            return $translate.instant("YEAR",{
                year : year
            },'messageformat');
        } else {
            return undefined;
        }
    };
    function getPlanTypeDisplayed(input) {
        if (validity_test(input)) {
            return plan_type_enum_g[input];
        } else {
            return undefined;
        }
    };
    function getPremiumModeDisplayed(input) {
        if (validity_test(input)) {
            return premium_mode_enum_g[input];
        } else {
            return undefined;
        }
    };
    function getPaymentModeDisplayed(input) {
        if (validity_test(input)) {
            return payment_mode_enum_g[input];
        } else {
            return undefined;
        }
    };

    return {
        init : function() {
            var thisService = this;
            var dfd = $q.defer();
            //$http.get(ctrl_url + "get_policy")
            $http.get(ctrl_url + "get_policy" + "?decache=" + Date.now())
                .success(function(policiesArray){
                    policies_g = thisService.processPoliciesArray(policiesArray);
                    dfd.resolve("OK");
                });

            return dfd.promise;
        },
        set : function(array) {
            policies_g = this.processPoliciesArray(array);
        },
        processPoliciesArray : function(policiesArray) {
            var output = [];
            angular.forEach(policiesArray, function(policy,index){
                var policyObj = {
                    id                      : policy.id,
                    index                   : index + 1,
                    policyNumber            : policy.policyNumber,
                    company                 : policy.company,
                    planType                : parseDbInt(policy.planType),
                    planTypeDisplayed       : getPlanTypeDisplayed(parseDbInt(policy.planType)),
                    planName                : policy.planName,
                    startDate               : parseDate(policy.startDate),
                    maturityDate            : parseDate(policy.maturityDate),
                    premium                 : parseDbFloat(policy.premium),
                    premiumMode             : parseDbInt(policy.premiumMode),
                    premiumModeDisplayed    : getPremiumModeDisplayed(parseDbInt(policy.premiumMode)),
                    paymentMode             : parseDbInt(policy.paymentMode),
                    paymentModeDisplayed    : getPaymentModeDisplayed(parseDbInt(policy.paymentMode)),
                    premiumTerm             : parseDbInt(policy.premiumTerm),
                    premiumTermMode         : parseDbBoolean(policy.premiumTermMode),
                    premiumTermDisplayed    : getTermDisplayed(policy.premiumTermMode,parseDbInt(policy.premiumTerm)),
                    coverageTerm            : parseDbInt(policy.coverageTerm),
                    coverageTermMode        : parseDbBoolean(policy.coverageTermMode),
                    coverageTermDisplayed   : getTermDisplayed(policy.coverageTermMode,parseDbInt(policy.coverageTerm)),
                    //sumAssured              : parseDbInt(policy.sumAssured),
                    deathSA                 : parseDbInt(policy.deathSA),
                    disabledSA              : parseDbInt(policy.disabledSA),
                    critSA                  : parseDbInt(policy.critSA),
                    tpdSA                   : parseDbInt(policy.tpdSA),
                    terminalSA              : parseDbInt(policy.terminalSA),
                    earlySA                 : parseDbInt(policy.earlySA),
                    hospitalSA              : parseDbInt(policy.hospitalSA),
                    hospitalIncome          : parseDbInt(policy.hospitalIncome),
                    accidentDeath           : parseDbInt(policy.accidentDeath),
                    accidentReimb           : parseDbInt(policy.accidentReimb),
                    retireIncome            : parseDbInt(policy.retireIncome),
                    currentValue            : parseDbInt(policy.currentValue),
                    surrenderValue          : parseDbInt(policy.surrenderValue),
                    beneficiary             : policy.beneficiary,
                    remarks                 : policy.remarks,
                    timestamp               : policy.timestamp
                };
                policyObj.sumAssured = parseUndefinedToZero(policyObj.deathSA) + parseUndefinedToZero(policyObj.disabledSA) +
                                       parseUndefinedToZero(policyObj.critSA) + parseUndefinedToZero(policyObj.tpdSA) +
                                       parseUndefinedToZero(policyObj.earlySA) + parseUndefinedToZero(policyObj.hospitalSA);
                output.push(policyObj);
            });

            return output;
        },
        getPolicies : function() {
            return policies_g;
        },
        removePolicyById : function(id) {
            var dfd = $q.defer();

            var input = {
                id : id
            };
            $http.post(ctrl_url + "remove_policy", input)
                .success(function(status){
                    if (status === "OK") {
                        for (var i = 0 ; i < policies_g.length ; i++ ) {
                            if (policies_g[i].id === id) {
                                policies_g.splice(i,1);
                                break;
                            }
                        }
                    }
                    dfd.resolve(status);
                });

            return dfd.promise;
        },
        getSumByColName : function(colName) {
            var pluck = _.pluck(policies_g,colName);
            var sum = 0;
            if (_.compact(pluck).length === 0) {
                return "";
            } else {
                angular.forEach(pluck, function(num,index){
                    if (validity_test(num)) sum += parseInt(num);
                });
            }
            return sum;
        },
        getAllSum : function() {
            var sums = [];
            var thisService = this;
            angular.forEach(allSum, function(colName,index){
                sums.push(thisService.getSumByColName(colName));
            });
            return sums;
        },
        getPoliciesNumber : function() {
            if (validity_test(policies_g)) {
                return policies_g.length;
            } else {
                return 0;
            }

        },
        getTotalPremium : function(cat,referenceMomentDate) {
            var sum = 0;
            referenceMomentDate = referenceMomentDate === undefined ? moment() : referenceMomentDate;
            angular.forEach(policies_g, function(policy,index){
                if (validity_test(policy.premium) && validity_test(policy.premiumMode)) {
                    //PREMIUM TERM MODE TRUE -> BY YEARS
                    if (policy.startDate !== undefined && policy.premiumTermMode === true && policy.premiumTerm !== undefined) {
                        var startDate = moment(policy.startDate,"LL");
                        var premiumExpiryDate = startDate.clone().add(policy.premiumTerm,"y");

                        if (startDate.isBefore(referenceMomentDate) && premiumExpiryDate.isAfter(referenceMomentDate)) {
                            //NOT EXPIRED
                            if (cat === undefined) {
                                sum += policy.premium * premium_mode_factor_g[policy.premiumMode];
                            } else {
                                if (plan_type_cat_enum_g[policy.planType] === cat) sum += policy.premium * premium_mode_factor_g[policy.premiumMode];
                            }
                        }
                    } else {
                        if (cat === undefined) {
                            sum += policy.premium * premium_mode_factor_g[policy.premiumMode];
                        } else {
                            if (plan_type_cat_enum_g[policy.planType] === cat) sum += policy.premium * premium_mode_factor_g[policy.premiumMode];
                        }
                    }
                }
            });
            return sum.toFixed(0);
        },
        getPremiumTrend : function() {
            var trendObj = {
                data : [],
                now  : []
            };
            var birthday = moment(personalDataDbService.getUserData("birthday"),"LL");
            var thisYearBirthday = birthday.clone().year(moment().year());
            var age = Math.abs(thisYearBirthday.diff(birthday,"y"));
            for (var i = 20 ; i <= 100 ; i +=5) {
                var incrementBirthday = birthday.clone().add(i,"y");

                trendObj.data.push({
                    year    : incrementBirthday.year(),
                    age     : i,
                    premium : this.getTotalPremium(undefined,incrementBirthday)
                });

                if (age > i && age < i + 5) {
                    trendObj.now = {
                        year    : thisYearBirthday.year(),
                        age     : age,
                        premium : this.getTotalPremium(undefined,thisYearBirthday),
                        type    : "now",
                        index   : (i - 20) / 5 + (age - i) / 5
                    };
                }


            }
            return trendObj;
        }
    }
}]);