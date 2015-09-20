app.service('policyDataService', function($rootScope,$q,$http,policyDataDbService,personalDataDbService,customSuggestedDbService) {

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

    return {
        getOverviewData : function() {
            var overview_array = [];
            angular.forEach(overview_title_g, function(title,index){
                if (title === "POLICIES_NUMBER") {
                    var amt = policyDataDbService.getPoliciesNumber();
                } else if (title === "TOTAL_PREMIUM") {
                    var amt = policyDataDbService.getTotalPremium();
                } else {
                    var amt = policyDataDbService.getSumByColName(overview_cat_g[index]);
                }
                overview_obj = {
                    title : title,
                    label : "TITLE_" + title,
                    amt : amt
                };
                overview_array.push(overview_obj);
            });
            return overview_array;
        },
        getProtectionsData : function() {
            var protections_array = [];
            var suggested = this.getSuggestedFigures();
            angular.forEach(doughnut_title_g, function(title,index){
                protections_obj = {
                    title : title,
                    label : "TITLE_" + title,
                    desc : "DESC_" + title,
                    amt : policyDataDbService.getSumByColName(overview_cat_g[ overview_to_dougnut_mapping_g[index] ]),
                    suggested : suggested[index].amt,
                    defaultSuggested : suggested[index].default,
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
            angular.forEach(doughnut_title_g, function(title,index){
                var amt       = policyDataDbService.getSumByColName(overview_cat_g[ overview_to_dougnut_mapping_g[index] ]);
                var suggest   = suggested[index].amt;
                var covered   = Math.min(amt,suggest);

                //CALC COVERAGE STATUS
                if (amt === "") {
                    notCover += 1;
                    notCoverP.push(title);
                } else if (amt < suggest) {
                    partiallyCover += 1;
                    partiallyCoverP.push(title);
                } else {
                    fullyCover += 1;
                    fullyCoverP.push(title);
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
            var personalData = personalDataDbService.getData();
            var annual_income = personalData.income;
            var annual_exps = personalData.expenditure;

            angular.forEach(doughnut_title_g, function(title,index){
                var suggested_income_method = income_factor_g[index] * annual_income;
                var suggested_expense_method = exps_factor_g[index] * annual_exps;
                var amt = Math.max(suggested_income_method,suggested_expense_method).toFixed(0);
                if (isNaN(amt) || !validity_test(amt)) amt = 0;
                suggested_array.push({
                    default : true,
                    amt     : amt
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
        }
    }
});