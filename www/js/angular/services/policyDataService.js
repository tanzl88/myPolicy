app.service('policyDataService', function($rootScope,$q,$http,$translate,policyDataDbService,personalDataDbService,customSuggestedDbService) {

    function getChartData(covered,shortfall) {
        return [
            {
                value: covered,
                color: suggested_color,
                title: 'Covered'
            }, {
                value: shortfall,
                color: shortfall_color,
                title: 'Shortfall'
            }
        ];
    }
    function calcTotalPresentValue(subject,realRateOfReturn,numberOfYears) {
        var totalPresentValue = 0;
        for (var i = 0 ; i < numberOfYears ; i++) {
            totalPresentValue += subject / Math.pow(1 + realRateOfReturn,i);
        }
        return totalPresentValue;
    }
    function useDefaultMethod(index,annual_income,annual_exps) {
        var suggested_income_method = income_factor_g[index] * annual_income;
        var suggested_expense_method = exps_factor_g[index] * annual_exps;
        return Math.max(suggested_income_method,suggested_expense_method);
    }
    function parseDbInt(value) {
        if (isNaN(parseInt(value))) {
            return 0
        } else {
            return parseInt(value);
        }
    }
    function getMonthly(amt) {
        return parseInt((amt/12).toFixed(0));
    }

    return {
        getOverviewData : function() {
            var overview_array = [];
            angular.forEach(overview_title_g, function(cat,index){
                overview_obj = {
                    title : cat.name,
                    label : "TITLE_" + cat.name,
                    type  : cat.type,
                    amt   : policyDataDbService.getSumByColName(cat.col),
                    chart : cat.chart
                };
                overview_array.push(overview_obj);
            });
            return overview_array;
        },
        getPremiumData : function() {
            var premium_array = {
                total       : parseDbInt(policyDataDbService.getTotalPremium()),
                income      : parseDbInt(personalDataDbService.getUserData("income")),
                protection  : parseDbInt(policyDataDbService.getTotalPremium("protection")),
                savings     : parseDbInt(policyDataDbService.getTotalPremium("savings"))
            };
            premium_array.left = premium_array.total - premium_array.protection - premium_array.savings;
            premium_array.protectionRatio   = premium_array.income === 0 ? 0 : (premium_array.protection / premium_array.income * 100).toFixed(0);
            premium_array.savingsRatio      = premium_array.income === 0 ? 0 : (premium_array.savings / premium_array.income * 100).toFixed(0);
            premium_array.totalRatio        = parseInt(premium_array.protectionRatio) + parseInt(premium_array.savingsRatio);
            return premium_array;
        },
        getProtectionsData : function() {
            var protections_array = [];
            var suggested = this.getSuggestedFigures();
            angular.forEach(doughnut_title_g, function(cat,index){
                var label = $translate.instant("TITLE_" + cat.name);
                protections_obj = {
                    title               : cat.name,
                    label               : "TITLE_" + cat.name,
                    desc                : "DESC_" + cat.name,
                    dropdown            : $translate.instant("CAT_COVERAGE_TREND",{cat : label}),
                    amt                 : policyDataDbService.getSumByColName(cat.col,moment()),
                    suggested           : suggested[index].amt,
                    defaultSuggested    : suggested[index].default,
                };
                protections_array.push(protections_obj);
            });
            protections_array = this.calcProtectionsChartData(protections_array);
            return protections_array;
        },
        getMeterData : function() {
            var suggestTotal    = 0;
            var coveredTotal    = 0;
            var notCover        = 0;
            var notCoverP       = [];
            var partiallyCover  = 0;
            var partiallyCoverP = [];
            var fullyCover      = 0;
            var fullyCoverP     = [];

            var suggested = this.getSuggestedFigures();
            angular.forEach(doughnut_title_g, function(cat,index){
                var amt       = policyDataDbService.getSumByColName(cat.col);
                var suggest   = suggested[index].amt;
                var covered   = Math.min(amt,suggest);

                //CALC COVERAGE STATUS
                if (amt === "") {
                    notCover += 1;
                    notCoverP.push(cat.name);
                } else if (amt < suggest) {
                    partiallyCover += 1;
                    partiallyCoverP.push(cat.name);
                } else {
                    fullyCover += 1;
                    fullyCoverP.push(cat.name);
                }

                //CALC TOTAL
                suggestTotal  += parseInt(suggest) * score_weight_g[index];
                coveredTotal  += parseInt(covered) * score_weight_g[index];
            });

            //CALCULATE PERCENT
            if (coveredTotal === 0 && suggestTotal === 0) {
                var percent = 0;
            } else {
                var percent = (coveredTotal / suggestTotal * 100).toFixed(0);
            }

            //GET CHART DATA
            if (suggestTotal === 0) {
                var chartData = getChartData(0,1);
            } else {
                var chartData = getChartData(coveredTotal,suggestTotal - coveredTotal);
            }

            var result = {
                suggest         : suggestTotal,
                cover           : coveredTotal,
                shortfall       : suggestTotal - coveredTotal,
                notCover        : notCover,
                notCoverP       : notCoverP,
                partiallyCover  : partiallyCover,
                partiallyCoverP : partiallyCoverP,
                fullyCover      : fullyCover,
                fullyCoverP     : fullyCoverP,
                percent         : percent,
                chartData       : chartData
            };
            return result;
        },
        calcProtectionsChartData : function(data_array) {
            angular.forEach(data_array, function(cat,index){
                var amt = cat.amt;
                var sug = cat.suggested;
                var diff = Math.abs(sug - amt);
                if (amt > sug) {
                    var diff_type = "Excess";
                    var color = 'transparent';
                    var shortfall = 0;
                } else {
                    var diff_type = "Shortfall";
                    var color = shortfall_color;
                    var shortfall = diff;
                }

                var catObj = data_array[index];
                catObj.diff = diff;
                catObj.diff_type = diff_type;
                catObj.color = {'background-color' : color};
                catObj.chartData = [
                    {
                        value: amt,
                        color: current_color,
                        title: 'Current'
                    }, {
                        value: shortfall,
                        color: color,
                        title: diff_type
                        //}, {
                        //    value: sug,
                        //    color: suggested_color,
                        //    title: 'Suggested'
                    }
                ];
            });
            return data_array;
        },
        getDefaultSuggestedFigures : function() {
            var suggested_array = [];
            var personalData = angular.copy(personalDataDbService.getData());
            var useAdvanced             = personalData.useAdvanced;
            var differentiateRate       = personalData.differentiateRate;
            var annual_income           = personalData.income === undefined ? 0 : personalData.income;
            var annual_exps             = personalData.expenditure === undefined ? 0 : personalData.expenditure;
            var treatmentCost           = personalData.treatmentCost === undefined          ? 0         : personalData.treatmentCost;
            var immediateCash           = personalData.immediateCash === undefined          ? 0         : personalData.immediateCash;
            var shortTermRateOfReturn   = personalData.shortTermRateOfReturn === undefined  ? undefined : personalData.shortTermRateOfReturn / 100;
            var shortTermInflation      = personalData.shortTermInflation === undefined     ? undefined : personalData.shortTermInflation / 100;
            var longTermRateOfReturn    = personalData.longTermRateOfReturn === undefined   ? undefined : personalData.longTermRateOfReturn / 100;
            var longTermInflation       = personalData.longTermInflation === undefined      ? undefined : personalData.longTermInflation / 100;
            var shortTermAdjRateOfReturn = (shortTermRateOfReturn - shortTermInflation) / (1 + shortTermInflation);
            var longTermAdjRateOfReturn  = (longTermRateOfReturn - longTermInflation)   / (1 + longTermInflation);


            //var realRateOfReturn = (rateOfReturn - inflationRate) / (1 + inflationRate);
            var dependencyYears = personalData.dependencyYears;
            var personalYears   = personalData.personalYears;
            var annualDependentIncomeNeeds = personalData.dependencyIncome;
            var annualPersonalIncomeNeeds = personalData.personalIncome;
            var amt, advanced;

            angular.forEach(doughnut_title_g, function(cat,index){
                if (useAdvanced == "1") {

                    if (cat.name === "FAMILY") {
                        if (validity_test(annualDependentIncomeNeeds) && validity_test(dependencyYears)) {
                            var dependencyRate = dependencyYears <= 5 && differentiateRate === 1 ? shortTermAdjRateOfReturn : longTermAdjRateOfReturn;
                            amt = calcTotalPresentValue(annualDependentIncomeNeeds,dependencyRate,dependencyYears) + immediateCash;
                            advanced = true;
                        } else {
                            amt = useDefaultMethod(index,annual_income,annual_exps);
                            advanced = false;
                        }
                    } else if (cat.name === "CRIT") {
                        var numberOfYears = 5;
                        if (differentiateRate == "1") {
                            amt = calcTotalPresentValue(annual_exps,shortTermAdjRateOfReturn,numberOfYears) + treatmentCost;
                            advanced = true;
                        } else {
                            amt = calcTotalPresentValue(annual_exps,longTermAdjRateOfReturn,numberOfYears) + treatmentCost;
                            advanced = true;
                        }
                    } else if (cat.name === "DISABLED") {
                        if (validity_test(annualDependentIncomeNeeds) && validity_test(annualPersonalIncomeNeeds) && validity_test(dependencyYears) && validity_test(personalYears)) {
                            var dependencyRate = dependencyYears <= 5 && differentiateRate === 1 ? shortTermAdjRateOfReturn : longTermAdjRateOfReturn;
                            var personalRate   = personalYears <= 5 && differentiateRate === 1   ? shortTermAdjRateOfReturn : longTermAdjRateOfReturn;
                            amt = calcTotalPresentValue(annualDependentIncomeNeeds,dependencyRate,dependencyYears) + calcTotalPresentValue(annualPersonalIncomeNeeds,personalRate,personalYears) + immediateCash;
                            advanced = true;
                        } else {
                            amt = useDefaultMethod(index,annual_income,annual_exps);
                            advanced = false;
                        }
                    } else {
                        amt = useDefaultMethod(index,annual_income,annual_exps);
                        advanced = false;
                    }

                } else {
                    amt = useDefaultMethod(index,annual_income,annual_exps);
                    advanced = false;
                }

                if (isNaN(amt) || !validity_test(amt)) amt = 0;

                suggested_array.push({
                    default     : true,
                    advanced    : advanced,
                    amt         : parseFloat(amt).toFixed(0)
                });
            });
            return suggested_array;
        },
        getSuggestedFigures : function() {
            var suggested_array = this.getDefaultSuggestedFigures();
            var editedSuggestedArray = customSuggestedDbService.get();
            angular.forEach(suggested_array, function(amt,index){
                if (validity_test(editedSuggestedArray[index])) {
                    suggested_array[index].amt = editedSuggestedArray[index];
                    suggested_array[index].default = false;
                }
            });
            return suggested_array;
        },
        updateSuggestedFigure : function(index, value) {
            customSuggestedDbService.update(index,value);
            return this.getProtectionsData();
        },
        removeSuggestedFigure : function(index, value) {
            customSuggestedDbService.remove(index);
            //delete editedSuggestedArray[index];
            return this.getProtectionsData();
        },
        getNetWorthData : function() {
            var personalObj = {};
            personalObj.personal = angular.copy(personalDataDbService.getData());
            //NULLIFY MISSING VARIABLES
            personalObj.personal.cashAssets          = personalObj.personal.cashAssets === undefined          ? 0 : personalObj.personal.cashAssets;
            personalObj.personal.investmentAssets    = personalObj.personal.investmentAssets === undefined    ? 0 : personalObj.personal.investmentAssets;
            personalObj.personal.debtRepayment       = personalObj.personal.debtRepayment === undefined       ? 0 : getMonthly(personalObj.personal.debtRepayment);
            personalObj.personal.income              = personalObj.personal.income === undefined              ? 0 : getMonthly(personalObj.personal.income);
            personalObj.personal.expenditure         = personalObj.personal.expenditure === undefined         ? 0 : getMonthly(personalObj.personal.expenditure);
            personalObj.personal.premium             = getMonthly(this.getPremiumData().total);
            //CALCULATE TOTAL
            personalObj.personal.totalAssets         = 0;
            personalObj.personal.totalLiabilities    = 0;
            personalObj.personal.expenses            = personalObj.personal.expenditure - personalObj.personal.debtRepayment - personalObj.personal.premium;
            personalObj.personal.savings             = personalObj.personal.income - personalObj.personal.expenditure;

            //ASSETS
            personalObj.assetsObj = assets_g;
            angular.forEach(personalObj.assetsObj, function(asset,index){
                if (asset.title === "INSURANCE") {
                    asset.amt = policyDataDbService.getSumByColName("currentValue") === "" ? 0 : policyDataDbService.getSumByColName("currentValue");
                } else {
                    asset.amt = personalObj.personal[asset.varName] === undefined ? 0 : personalObj.personal[asset.varName];
                }
                personalObj.personal.totalAssets += asset.amt;

            });
            //CALCULATE PERCENT
            angular.forEach(personalObj.assetsObj, function(asset,index){
                asset.percent = personalObj.personal.totalAssets === 0 ? 0 : (asset.amt / personalObj.personal.totalAssets * 100).toFixed(0);
            });
            //LIABILITIES
            personalObj.liabilitiesObj = liabilities_g;
            angular.forEach(personalObj.liabilitiesObj, function(liability,index) {
                liability.amt = personalObj.personal[liability.varName] === undefined ? 0 : personalObj.personal[liability.varName];
                personalObj.personal.totalLiabilities += liability.amt;
            });
            //CALCULATE PERCENT
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
                if (isNaN(ratio.amt) || !validity_test(ratio.amt)) ratio.amt = 0;
                ratio.amt = ratio.amt + suffix;
            });

            return personalObj;
        }
    }
});