app.controller('ChangePasswordCtrl', function($scope,$rootScope,$http,$toast,$ionicHistory,errorHandler) {
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

app.controller('ChangeEmailCtrl', function($scope,$rootScope,$http,$toast,$ionicHistory,errorHandler) {
    $scope.reset = function(form) {
        if (form.$invalid) {
            form.oldEmail.$setDirty();
            form.newEmail.$setDirty();
        } else {
            if (!$scope.emailExist) {
                var input = {
                    oldEmail : form.oldEmail.$modelValue,
                    newEmail : form.newEmail.$modelValue,
                };
                $http.post(register_url + "change_email", input)
                    .success(function(status) {
                        console.log(status);
                        if (status === "success") {
                            $ionicHistory.goBack();
                            $toast.show("CHANGE_EMAIL_SUCCESS");
                        } else if (status === "wrong_email") {
                            $toast.show("WRONG_EMAIL")
                        } else if (status === "email_taken") {
                            $toast.show("EMAIL_EXIST_ERROR")
                        } else {
                            errorHandler.handleOthers(status);
                        }
                    });
            }
        }
    };

    $scope.checkEmailExist = function(form) {
        var input = {
            email: form.newEmail.$modelValue
        };
        $http.post(register_url + 'get_email_status', input).
            success(function(result) {
                console.log(result);
                if (result == "1") {
                    $scope.emailExist = false;
                } else {
                    $scope.emailExist = true;
                }
            });
    };
});