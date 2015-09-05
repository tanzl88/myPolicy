app.controller('EditAdvisorProfileCtrl', function($scope,$http,$ionicHistory,advisorDataDbService,loadingService,errorHandler) {
    $scope.initVar = function() {
        if (advisorDataDbService.profileFound()) {
            $scope.dataObj = advisorDataDbService.getData();
        } else {
            $scope.dataObj = {
                name        : undefined,
                title       : undefined,
                company     : undefined,
                repNo       : undefined,
                address     : undefined,
                phone       : undefined,
                email       : undefined,
                website     : undefined,
                education   : undefined
            };
        }
    };

    $scope.submit = function(form) {
        if (form.$invalid) {
            form.name.$setDirty();
            form.company.$setDirty();
        } else {
            loadingService.show("SUBMITTING");
            var input = {
                name        : form.name.$modelValue,
                title       : form.title.$modelValue,
                company     : form.company.$modelValue,
                repNo       : form.repNo.$modelValue,
                address     : form.address.$modelValue,
                phone       : form.phone.$modelValue,
                email       : form.email.$modelValue,
                website     : form.website.$modelValue,
                education   : form.education.$modelValue,
            };
            //console.log(input);

            $http.post(ctrl_url + "set_advisor_profile", input)
                .success(function(statusData){
                    if (statusData.status === "OK") {
                        var homeViewScope = $("#home_view").scope();
                        homeViewScope.advisorProfileFound = true;
                        homeViewScope.advisorData = input;
                        advisorDataDbService.set(input);

                        //GO BACK TO PROFILE AND ANIMATE DASHBOARD
                        loadingService.hide();
                        $ionicHistory.goBack();
                        homeViewScope.dashboardAnimate();
                    } else {
                        errorHandler.handleOthers(statusData.status);
                    }

                });
        }
    };
});

