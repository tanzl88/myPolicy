app.service('customSuggestedDbService', function($rootScope,$http,errorHandler) {
    var customSuggested = [];
    $rootScope.$on("LOGOUT", function(){
        customSuggested = [];
    });

    return {
        get : function() {
            return customSuggested;
        },
        //get : function() {
        //    $http.post(ctrl_url + "get_custom_suggested",{})
        //        .success(function(){
        //
        //        });
        //},
        set : function(suggestedData) {
            customSuggested = [
                suggestedData.accident,
                suggestedData.basic,
                suggestedData.crit,
                suggestedData.disabled,
                suggestedData.disabled_income,
                suggestedData.early,
                suggestedData.family
            ];
            angular.forEach(customSuggested, function(value,index){
                if (value === null) customSuggested[index] = undefined;
            });
        },
        update : function(index,value) {
            customSuggested[index] = value;
            var input = {
                accident        : customSuggested[0],
                basic           : customSuggested[1],
                crit            : customSuggested[2],
                disabled        : customSuggested[3],
                disabled_income : customSuggested[4],
                early           : customSuggested[5],
                family          : customSuggested[6]
            };
            angular.forEach(input, function(value,index){
                if (value === undefined) {
                    delete input[index];
                }
            });
            $http.post(ctrl_url + "update_custom_suggested", input)
                .success(function(status){
                    if (status === "OK") {

                    } else {
                        errorHandler.handleOthers(status);
                    }
                });
        },
        remove : function(index) {
            this.update(index,undefined);
        }
    }
});