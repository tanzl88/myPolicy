app.controller('ChangePasswordCtrl', function($scope,$rootScope,$http,$toast,$ionicHistory,errorHandler) {
    $scope.initVar = function() {

    };

    $scope.reset = function(form) {
        if (form.$invalid) {
            form.oldPassword.$setDirty();
            form.password.$setDirty();
            form.confirm_password.$setDirty();
        } else {
            var input = {
                oldPassword : form.oldPassword.$modelValue,
                newPassword : form.password.$modelValue,
            };
            $http.post(register_url + "change_password_login", input)
                .success(function(status) {
                    console.log(status);
                    if (status === "success") {
                        $ionicHistory.goBack();
                        $toast.show("CHANGE_PASSWORD_SUCCESS");
                    } else if (status === "wrong_password") {
                        $toast.show("WRONG_PASSWORD")
                    } else {
                        errorHandler.handleOthers(status);
                    }
                });
        }
    };
});