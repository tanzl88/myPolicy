app.controller('CustomizeFieldNamesCtrl', ['$scope', '$translate', '$http', '$ionicHistory', '$toast', 'loadingService', 'fieldNameService', 'errorHandler', function($scope,$translate,$http,$ionicHistory,$toast,loadingService,fieldNameService,errorHandler) {
    $scope.submit = function(form) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('Core', 'Policy', 'Add / Edit');

        var error = false;
        var submitObj = {};
        for (var i = 0 ; i < $scope.fieldNamesArray.length ; i++) {
            var field = $scope.fieldNamesArray[i];
            if (field.left < 0) {
                error = true;
                break;
            } else {
                submitObj[field.name] = field.fieldName;
            }
        }

        if (!error) {
            loadingService.show("SUBMITTING");
            $http.post(ctrl_url + "set_fieldname_full_table", submitObj)
                .success(function(status){
                    if (status === "OK") {
                        //REFRESH FIELD NAME
                        fieldNameService.setFieldName("full_table",submitObj);
                        $translate.refresh("en");

                        loadingService.hide();
                        $ionicHistory.goBack();
                        $toast.show("FIELDNAME_UPDATED");
                    } else {
                        errorHandler.handleOthers(result.status);
                    }
                });
        }


    };

    $scope.initVar = function() {
        $scope.maxLength = 50;
        $scope.fieldNamesArray = angular.copy(full_table_g);
        angular.forEach($scope.fieldNamesArray, function(field,index){
            field.fieldName = $translate.instant(field.title);
            field.count = field.fieldName.length;
            field.left  = $scope.maxLength - field.fieldName.length;
            field.show  = false;

        });

        $scope.showCount = function(index) {
            $scope.fieldNamesArray[index].show = true;
        };
        $scope.hideCount = function(index) {
            $scope.fieldNamesArray[index].show = false;
        };
        $scope.updateCount = function(index) {
            updateField = $scope.fieldNamesArray[index];
            updateField.count = updateField.fieldName.length;
            updateField.left  = $scope.maxLength - updateField.fieldName.length;
        };
    };
}]);