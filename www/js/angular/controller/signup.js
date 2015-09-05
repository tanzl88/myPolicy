app.controller('SignUpCtrl', function($scope,$http,$ionicModal,$ionicHistory,$toast,modalService) {
    $scope.initVar = function() {
        $scope.advisorRegister = true;
    };

    $scope.signUp = function(form) {
        if (form.$invalid) {
            form.email.$setDirty();
            form.password.$setDirty();
            form.confirm_password.$setDirty();
        } else {
            if (!$scope.emailExist) {
                //var type = form.advisorRegister.$modelValue === true ? "advisor" : "client";
                var type = "client";

                var input = {
                    email       : form.email.$modelValue,
                    password    : form.password.$modelValue,
                    type        : type
                };
                $http.post(register_url + "register", input)
                    .success(function(status){
                        if (status === "success") {
                            $scope.type = "signup";
                            $scope.email = form.email.$modelValue;
                            //$scope.openModal();
                            $scope.loginMsg.show();
                        } else {
                            $toast.show("SIGN_UP_FAILED");
                        }
                    });

            }
        }
    };
    $scope.checkEmailExist = function() {
        $http.post(register_url + 'get_email_status', {email: $(".signUpEmailInput").scope().signup.email}).
            success(function(result) {
                if (result == "1") {
                    $scope.emailExist = false;
                } else {
                    $scope.emailExist = true;
                }
            });
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

    // ------------- CHECKBOX -------------
    $scope.toggleCheckbox = function() {

        //$("#advisor_register_container i").click();
        $scope.advisorRegister = !$scope.advisorRegister;
        console.log($scope.advisorRegister);
    };
});

app.controller('RetrieveAccountCtrl', function($scope,$http,$toast,$ionicModal,$ionicHistory,modalService) {
    $scope.initVar = function() {
        //NO CACHE
    };

    $scope.signUp = function(form) {
        if (form.$invalid) {
            form.email.$setDirty();
            form.password.$setDirty();
            form.confirm_password.$setDirty();
            form.advisorEmail.$setDirty();
            form.code.$setDirty();
        } else {
            if (!$scope.emailExist) {;
                var input = {
                    email           : form.email.$modelValue,
                    password        : form.password.$modelValue,
                    advisorEmail    : form.advisorEmail.$modelValue,
                    token           : form.code.$modelValue
                };
                $http.post(register_url + "match_token", input)
                    .success(function(statusData){
                        if (statusData === "OK") {
                            $scope.type = "signup";
                            $scope.email = form.email.$modelValue;
                            //$scope.openModal();
                            $scope.loginMsg.show();
                        } else if (statusData === "token_error") {
                            $toast.show("TOKEN_ERROR");
                        } else if (statusData === "advisor_not_found") {
                            $toast.show("ADVISOR_NOT_FOUND_ERROR");
                        } else {
                            $toast.show("RETRY_ERROR");
                        }
                    });
            }
        }
    };
    $scope.checkEmailExist = function() {
        $http.post(register_url + 'get_email_status', {email: $(".signUpEmailInput").scope().signup.email}).
            success(function(result) {
                if (result == "1") {
                    $scope.emailExist = false;
                } else {
                    $scope.emailExist = true;
                }
            });
    };

    $scope.goToLogin = function() {
        $ionicHistory.goBack();
        $scope.loginMsg.hide();
        //$scope.closeModal();
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