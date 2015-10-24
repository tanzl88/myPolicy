app.service('$toast', ['$translate', '$mdToast', '$timeout', function($translate,$mdToast,$timeout) {

    //function showToast(message) {
    //    $mdToast.show(
    //        $mdToast.simple()
    //            .content(message)
    //            .position("top")
    //            .hideDelay(3000)
    //    );
    //}

    function showToast(message) {
        $mdToast.show({
            controller: 'ToastCtrl',
            templateUrl: 'toast.html',
            hideDelay: 3000,
            position: "top",
            locals: { content : message}
        });
    }

    return {
        showSimple : function(string) {
            showToast(string);
        },
        show : function(string,varReplace) {
            $translate(string,varReplace).then(function (translation) {
                showToast(translation);
            });
        },
        showMiddle : function(string) {
            $translate(string).then(function (translation) {
                showToast(translation);
            });
        },
        showClientNotSelected : function() {
            $mdToast.show({
                controller: 'WarningToastCtrl',
                templateUrl: 'warning-toast.html',
                hideDelay: 1500,
                position: "top"
            });
        }
    }
}]);