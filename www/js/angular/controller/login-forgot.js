app.controller('ForgotCtrl', function($scope,$http,$toast,$ionicModal,$ionicHistory,modalService) {
    $scope.resetPassword = function(form) {
        if (form.$invalid) {
            form.email.$setDirty();
        } else {
            var input = {
                email : form.email.$modelValue
            };
            $http.post(register_url + "forgot_password", input)
                .success(function(status){
                    if (status === "success") {
                        $scope.type = "forgot";
                        $scope.email = form.email.$modelValue;
                        //$scope.openModal();
                        $scope.loginMsg.show();
                    } else if (status === "not_activated") {
                        $scope.type = "notActivated";
                        $scope.email = form.email.$modelValue;
                        //$scope.openModal();
                        $scope.loginMsg.show();
                    } else if (status === "log_in") {
                        $toast.show("RESET_PASSWORD_FAILED_LOG_IN");
                    } else if (status === "failed") {
                        $toast.show("RESET_PASSWORD_FAILED")
                    } else if (status === "email_not_taken") {
                        $toast.show("EMAIL_NOT_FOUND_ERROR");
                    } else {
                        $toast.show("UNKNOWN_ERROR");
                    }
                    //
                    //if (status === "success") {
                    //    $scope.type = "forgot";
                    //    $scope.email = form.email.$modelValue;
                    //    $scope.openModal();
                    //} else if (status === "failed") {
                    //    $toast.show("RESET_PASSWORD_FAILED");
                    //} else {
                    //    $toast.show("UNKNOWN_ERROR");
                    //}
                });
        }
    };

    $scope.goToLogin = function() {
        $ionicHistory.goBack(-2);
        //$scope.closeModal();
        $scope.loginMsg.hide();
    };

    //MODAL
    modalService.init("login_msg","login_msg",$scope).then(function(modal){
        $scope.loginMsg = modal;
    });
    //$ionicModal.fromTemplateUrl('login_msg.html', {
    //    scope: $scope,
    //    animation: 'slide-in-up'
    //}).then(function(modal) {
    //    $scope.modal = modal
    //});
    //$scope.openModal = function() {
    //    $scope.modal.show()
    //};
    //$scope.closeModal = function() {
    //    $scope.modal.hide();
    //};
    //$scope.$on('$destroy', function() {
    //    $scope.modal.remove();
    //});
});

app.controller('ResetPasswordCtrl', function($scope,$rootScope,$http,$toast,$ionicModal,$ionicHistory,modalService) {
    $scope.initVar = function() {
        $scope.args = $rootScope.args;
        delete $rootScope.args;
    };

    $scope.reset = function(form) {
        if (form.$invalid) {
            form.password.$setDirty();
            form.confirm_password.$setDirty();
        } else {
            var input = {
                userId   : $scope.args[0],
                passKey  : $scope.args[1],
                password : form.password.$modelValue
            };
            $http.post(register_url + "change_password", input)
                .success(function(status) {
                    if (status === "success") {
                        $scope.type = "resetSuccess";
                        //$scope.openModal();
                        $scope.loginMsg.show();
                    } else if (status === "not_activated") {
                        $scope.type = "notActivated";
                        //$scope.openModal();
                        $scope.loginMsg.show();
                    } else if (status === "log_in") {
                        $toast.show("RESET_PASSWORD_FAILED_LOG_IN");
                    } else if (status === "failed") {
                        $toast.show("RESET_PASSWORD_FAILED")
                    } else if (status === "email_not_taken") {
                        $toast.show("EMAIL_NOT_FOUND_ERROR");
                    } else {
                        $toast.show("UNKNOWN_ERROR");
                    }
                });
        }
    };

    $scope.goToLogin = function() {
        $ionicHistory.goBack();
        //$scope.closeModal();
        $scope.loginMsg.hide();
    };

    //MODAL
    modalService.init("login_msg","login_msg",$scope).then(function(modal){
        $scope.loginMsg = modal;
    });
    //$ionicModal.fromTemplateUrl('login_msg.html', {
    //    scope: $scope,
    //    animation: 'slide-in-up'
    //}).then(function(modal) {
    //    $scope.modal = modal
    //});
    //$scope.openModal = function() {
    //    console.log("SHOW MODAL");
    //    $scope.modal.show()
    //};
    //$scope.closeModal = function() {
    //    $scope.modal.hide();
    //};
    //$scope.$on('$destroy', function() {
    //    $scope.modal.remove();
    //});
});