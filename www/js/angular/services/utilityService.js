app.service('utilityService', function($rootScope,$cordovaKeyboard) {
    return {
        getKeyboardDelay : function() {
            var delay_time = 0;
            if (ionic.Platform.isWebView() && $cordovaKeyboard.isVisible()) {
                delay_time = 400;
                $cordovaKeyboard.close();
            }
            return delay_time;
        },
        resetForm : function(id,defaultObj) {
            var formScope = angular.element(document.getElementById(id)).scope();
            console.log(formScope);
            for (var key in formScope) {
                if (validity_test(formScope[key]) && formScope[key].$pristine !== undefined) {
                    //console.log(formScope);
                    //console.log(formScope[key]);
                    formScope[key].$setPristine();
                    angular.forEach(defaultObj, function(value,varName){
                        formScope[varName] = value;
                    });
                    break;
                }
            }
        }
    }
});