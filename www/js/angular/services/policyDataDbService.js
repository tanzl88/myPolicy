app.service('policyDataDbService', function($rootScope,$q,$http,$translate,personalDataDbService) {
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
    var multiplierAllowed = [
        "deathSA",
        "tpdSA",
        "critSA",
        "earlySA"
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

    function calculatePremium(cat,planType,premium,premiumMode) {
        if (cat === undefined) {
            return premium * premium_mode_factor_g[premiumMode];
        } else {
            if (plan_type_cat_enum_g[planType] === cat) {
              return premium * premium_mode_factor_g[premiumMode];
            } else {
                return 0;
            }
        }
    }

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
                    payoutTerm              : parseDbInt(policy.payoutTerm),
                    payoutTermMode          : parseDbBoolean(policy.payoutTermMode),
                    payoutTermDisplayed     : getTermDisplayed(policy.payoutTermMode,parseDbInt(policy.payoutTerm)),
                    multiplierFactor        : parseDbFloat(policy.multiplierFactor),
                    multiplierAge           : parseDbInt(policy.multiplierAge),
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
        getSumByColName : function(colName,referenceMomentDate) {
            var pluck = _.pluck(policies_g,colName);
            var sum = 0;
            var birthday = moment(personalDataDbService.getUserData("birthday"),"LL");
            if (_.compact(pluck).length === 0) {
                return "";
            } else {
                //referenceMomentDate = referenceMomentDate === undefined ? moment() : referenceMomentDate;
                if (referenceMomentDate === undefined) {
                    angular.forEach(policies_g, function(policy,index){
                        var coverage = policy[colName];
                        if (validity_test(coverage)) sum += parseInt(coverage);
                    });
                } else {



                    angular.forEach(policies_g, function(policy,index){
                        var coverage = policy[colName];
                        if (validity_test(coverage)) {

                            //LOGIC FOR MULTIPLIER FACTOR
                            var multiplierFactor = 1;
                            if (policy.planType === 0 && validity_test(policy.multiplierFactor) && validity_test(policy.multiplierAge)) {
                                //CHECK IF IT IS DEATH, TPD, CI, EARLY
                                if (multiplierAllowed.indexOf(colName) >= 0) {
                                    var multiplierEndDate = birthday.clone().add(policy.multiplierAge,"y");
                                    //IF MULTIPLIER AGE IS AFTER REFERENCE DATE
                                    if (multiplierEndDate.isAfter(referenceMomentDate)) {
                                        multiplierFactor = policy.multiplierFactor;
                                    }
                                }
                            }

                            //PREMIUM TERM MODE TRUE -> BY YEARS, FALSE -> BY AGE
                            var isWithinCoverage = true;
                            if (policy.startDate !== undefined && policy.coverageTermMode !== undefined && policy.coverageTerm !== undefined) {
                                //IF NO BIRTHDAY IS AVAILABLE AND COVERAGE TERM CALCULATE BY AGE -> UNABLE TO CALCULATE EXPIRY DATE
                                //DEFAULT TO ADD TO SUM
                                if (policy.coverageTermMode || birthday !== undefined) {
                                    //CALCULATE COVERAGE END DATE BY DIFFERENT INPUT MODE
                                    //PREMIUM TERM MODE TRUE -> BY YEARS, FALSE -> BY AGE
                                    var startDate = moment(policy.startDate,"LL");
                                    if (policy.coverageTermMode) {
                                        var coverageYear = policy.coverageTerm;
                                    } else {
                                        var startDateAtBirth = startDate.clone().year(birthday.year());
                                        var coverageYear = policy.coverageTerm - startDate.diff(startDateAtBirth,"y");
                                    }
                                    var coverageExpiryDate = startDate.clone().add(coverageYear,"y");

                                    //IF REFERENCE DATE IS WITHIN POLICY COVERAGE PERIOD
                                    if (startDate.isBefore(referenceMomentDate) && coverageExpiryDate.isAfter(referenceMomentDate)) {
                                        //NOT EXPIRED
                                        isWithinCoverage = true;
                                    } else {
                                        isWithinCoverage = false;
                                    }
                                }
                            }

                            if(isWithinCoverage) {
                               sum += parseInt(coverage) * multiplierFactor;
                            }


                            //PREMIUM TERM MODE TRUE -> BY YEARS, FALSE -> BY AGE
                            //if (policy.startDate !== undefined && policy.coverageTermMode !== undefined && policy.coverageTerm !== undefined) {
                            //    //IF NO BIRTHDAY IS AVAILABLE AND COVERAGE TERM CALCULATE BY AGE -> UNABLE TO CALCULATE EXPIRY DATE
                            //    //DEFAULT TO ADD TO SUM
                            //    if (!policy.coverageTermMode && birthday === undefined) {
                            //        sum += parseInt(coverage);
                            //    } else {
                            //        var startDate = moment(policy.startDate,"LL");
                            //
                            //
                            //        //PREMIUM TERM MODE TRUE -> BY YEARS, FALSE -> BY AGE
                            //        if (policy.coverageTermMode) {
                            //            var coverageYear = policy.coverageTerm;
                            //        } else {
                            //            var startDateAtBirth = startDate.clone().year(birthday.year());
                            //            var coverageYear = policy.coverageTerm - startDate.diff(startDateAtBirth,"y");
                            //        }
                            //        var coverageExpiryDate = startDate.clone().add(coverageYear,"y");
                            //
                            //
                            //
                            //        //IF REFERENCE DATE IS WITHIN POLICY COVERAGE PERIOD
                            //        if (startDate.isBefore(referenceMomentDate) && coverageExpiryDate.isAfter(referenceMomentDate)) {
                            //            //NOT EXPIRED
                            //            sum += (parseInt(coverage) * multiplierFactor);
                            //        }
                            //    }
                            //} else {
                            //    sum += parseInt(coverage);
                            //}
                        }
                    });
                }

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
        getPayoutData : function() {
            var payout = [];
            var payoutObj = {};
            var sum = 0;
            var birthday = moment(personalDataDbService.getUserData("birthday"),"LL");
            angular.forEach(policies_g, function(policy,index){
                if (policy.surrenderValue !== undefined) {

                    if (policy.payoutTerm === undefined || policy.startDate === undefined) {
                        var age = 99999;
                    } else {
                        if (policy.payoutTermMode) {
                            var payoutDate = moment(policy.startDate,"LL").clone().add(policy.payoutTerm,"y");
                            var startDateAtBirth = payoutDate.clone().year(birthday.year());
                            var age = payoutDate.diff(startDateAtBirth,"y");
                        } else {
                            var age = policy.payoutTerm;
                        }
                    }

                    if (payoutObj[age] === undefined) {
                        var surrenderValue = policy.surrenderValue !== undefined ? parseInt(policy.surrenderValue) : 0;
                        var currentValue   = policy.currentValue !== undefined   ? parseInt(policy.currentValue)   : 0;
                        payoutObj[age] = {
                            age          : age,
                            surrenderAmt : surrenderValue,
                            cashAmt      : currentValue,
                        };
                    } else {
                        if (policy.surrenderValue !== undefined) payoutObj[age].surrenderAmt  += parseInt(policy.surrenderValue);
                        if (policy.currentValue !== undefined)   payoutObj[age].cashAmt       += parseInt(policy.currentValue);
                    }
                }
            });

            //RESTRUCTURE OUTPUT TO ARRAY
            for (var key in payoutObj) {
                payout.push(payoutObj[key]);
            }

            return _.sortBy(payout, 'age');
        },
        getTotalPremium : function(cat,referenceMomentDate) {
            var sum = 0;
            var birthday = moment(personalDataDbService.getUserData("birthday"),"LL");
            referenceMomentDate = referenceMomentDate === undefined ? moment() : referenceMomentDate;
            angular.forEach(policies_g, function(policy,index){
                if (validity_test(policy.premium) && validity_test(policy.premiumMode)) {
                    if (policy.startDate !== undefined && policy.premiumTermMode !== undefined && policy.premiumTerm !== undefined) {
                        //IF NO BIRTHDAY IS AVAILABLE AND PREMIUM TERM CALCULATE BY AGE -> UNABLE TO CALCULATE EXPIRY DATE
                        //DEFAULT TO ADD TO SUM
                        if (!policy.premiumTermMode && birthday === undefined) {
                            sum += calculatePremium(cat,policy.planType,policy.premium,policy.premiumMode);
                        } else {
                            var startDate = moment(policy.startDate,"LL");
                            //PREMIUM TERM MODE TRUE -> BY YEARS, FALSE -> BY AGE
                            if (policy.premiumTermMode) {
                                var premiumYear = policy.premiumTerm;
                            } else {
                                var startDateAtBirth = startDate.clone().year(birthday.year());
                                var premiumYear = policy.premiumTerm - startDate.diff(startDateAtBirth,"y");
                            }
                            var premiumExpiryDate = startDate.clone().add(premiumYear,"y");

                            if (startDate.isBefore(referenceMomentDate) && premiumExpiryDate.isAfter(referenceMomentDate)) {
                                //NOT EXPIRED
                                sum += calculatePremium(cat,policy.planType,policy.premium,policy.premiumMode);
                            }
                        }
                    } else {
                        sum += calculatePremium(cat,policy.planType,policy.premium,policy.premiumMode);
                    }
                }
            });
            return sum.toFixed(0);
        },
        getTotalPremium2 : function(referenceMomentDate) {
            var premium = {
                protection : {
                    title   : "PROTECTION_POLICIES",
                    sum     : 0,
                    num     : 0
                },
                savings : {
                    title   : "SAVINGS_POLICIES",
                    sum     : 0,
                    num     : 0
                },
                others : {
                    title   : "UNKNOWN",
                    sum     : 0,
                    num     : 0
                },
                total : {
                    title   : "TOTAL",
                    sum     : 0,
                    num     : 0
                }
            };

            var birthday = moment(personalDataDbService.getUserData("birthday"),"LL");
            referenceMomentDate = referenceMomentDate === undefined ? moment() : referenceMomentDate;
            angular.forEach(policies_g, function(policy,index){
                var planCat = policy.planType === undefined ? "others" : plan_type_cat_enum_g[policy.planType];
                if (validity_test(policy.premium) && validity_test(policy.premiumMode)) {
                    if (policy.startDate !== undefined && policy.premiumTermMode !== undefined && policy.premiumTerm !== undefined) {
                        //IF NO BIRTHDAY IS AVAILABLE AND PREMIUM TERM CALCULATE BY AGE -> UNABLE TO CALCULATE EXPIRY DATE
                        //DEFAULT TO ADD TO SUM
                        if (!policy.premiumTermMode && birthday === undefined) {
                            premium[planCat].sum += policy.premium * premium_mode_factor_g[policy.premiumMode];
                            premium[planCat].num += 1;
                        } else {
                            var startDate = moment(policy.startDate,"LL");
                            //PREMIUM TERM MODE TRUE -> BY YEARS, FALSE -> BY AGE
                            if (policy.premiumTermMode) {
                                var premiumYear = policy.premiumTerm;
                            } else {
                                var startDateAtBirth = startDate.clone().year(birthday.year());
                                var premiumYear = policy.premiumTerm - startDate.diff(startDateAtBirth,"y");
                            }
                            var premiumExpiryDate = startDate.clone().add(premiumYear,"y");

                            if (startDate.isBefore(referenceMomentDate) && premiumExpiryDate.isAfter(referenceMomentDate)) {
                                //NOT EXPIRED
                                premium[planCat].sum += policy.premium * premium_mode_factor_g[policy.premiumMode];
                                premium[planCat].num += 1;
                            }
                        }
                    } else {
                        premium[planCat].sum += policy.premium * premium_mode_factor_g[policy.premiumMode];
                        premium[planCat].num += 1;
                    }
                } else {
                    premium[planCat].num += 1;
                }
            });

            //CALCULATE TOTAL
            premium.total.sum = premium.protection.sum + premium.savings.sum + premium.others.sum;
            premium.total.num = premium.protection.num + premium.savings.num + premium.others.num;

            //REMOVE UNKNOWN IF EMPTY
            if (premium.others.num === 0) delete premium.others;

            //RESTRUCTURE OUTPUT TO ARRAY
            var output = [];
            for (var key in premium) {
                output.push({
                    title : premium[key].title,
                    sum   : premium[key].sum,
                    num   : premium[key].num,
                });
            }


            return output;
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

                //SPECIAL DATA POINT FOR CURRENT AGE
                if (age >= i && age < i + 5) {
                    var nowObj = {
                        year    : thisYearBirthday.year(),
                        age     : age,
                        premium : this.getTotalPremium(undefined,undefined),
                        type    : "now",
                        index   : (i - 20) / 10 + (age - i) / 10
                    };
                    if (age < i + 5)  trendObj.data.push(nowObj);
                    if (age < i + 10) trendObj.now = nowObj;

                }
            }
            return trendObj;
        },
        getCoverageTrend : function() {
            var trendObj = {
                data : [],
                //now  : []
            };
            var thisService = this;
            var birthday = moment(personalDataDbService.getUserData("birthday"),"LL");
            var thisYearBirthday = birthday.clone().year(moment().year());
            var age = Math.abs(thisYearBirthday.diff(birthday,"y"));

            angular.forEach(doughnut_title_g, function(cat,index){
                var catArray = [];
                for (var i = 20 ; i <= 100 ; i +=5) {
                    var incrementBirthday = birthday.clone().add(i,"y");

                    catArray.push({
                        title    : cat.name,
                        year     : incrementBirthday.year(),
                        age      : i,
                        coverage : thisService.getSumByColName(cat.col,incrementBirthday)
                    });

                    //if (age >= i && age < i + 5) {
                    //    trendObj.now = {
                    //        year    : thisYearBirthday.year(),
                    //        age     : age,
                    //        premium : this.getTotalPremium(undefined,undefined),
                    //        type    : "now",
                    //        index   : (i - 20) / 5 + (age - i) / 5
                    //    };
                    //}
                }
                trendObj.data.push(catArray);
            });
            return trendObj;
        }
    }
});