app.service('reactDOMService', ['$translate', '$filter', 'policyDataDbService', function($translate,$filter,policyDataDbService) {
    return {
        getFullTable : function(fullTableColumnsArray) {
            var fullTableObj = [];
            var sums         = policyDataDbService.getAllSum();
            var policies     = policyDataDbService.getPolicies();

            for (var i = 0 ; i < fullTableColumnsArray.length ; i++) {
                var fullTableColumns = fullTableColumnsArray[i];
                fullTableObj.push({
                    head : [],
                    body : []
                });

                //HEAD
                angular.forEach(fullTableColumns,function(col,index){
                    fullTableObj[i].head.push({
                        title : $translate.instant(col.title),
                        width : col.width
                    });
                });

                //BODY
                angular.forEach(policies,function(policy,policyIndex){
                    var rowArray = [];
                    angular.forEach(fullTableColumns,function(col,index){
                        if (col.type === "currency") {
                            rowArray.push($filter("currency")(policy[col.varName],"",0));
                        } else {
                            rowArray.push(policy[col.varName]);
                        }
                    });
                    fullTableObj[i].body.push(rowArray);
                });

                //SUM
                var sumColStart     = fullTableColumnsArray.length === 2 ? 2 : 13;
                var sumTableIndex   = fullTableColumnsArray.length === 2 ? 1 : 0;
                if (i === sumTableIndex) {
                    var rowArray = [];
                    for (var j = 0; j < fullTableColumns.length; j++) {
                        if (j < sumColStart) {
                            rowArray.push(undefined);
                        } else {
                            rowArray.push($filter("currency")(sums[j - sumColStart], "", 0));
                        }
                    }
                    fullTableObj[i].body.push(rowArray);
                }
            }

            return fullTableObj;
        }
    }
}]);