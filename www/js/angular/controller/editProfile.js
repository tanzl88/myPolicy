app.controller('EditProfileCtrl', function($scope,$translate,$timeout,$http,
                                           $state,$ionicHistory,$ionicNavBarDelegate,$ionicViewSwitcher,
                                           horoscopeService,ageIconService,personalDataDbService,loadingService,errorHandler) {
    //---------------------STYLING---------------------
    var container_width = window_width_g * 0.42;
    var container_width = window_height_g * 0.23;
    $("#profile_view .img_container").width(container_width).height(container_width);
    $("#profile_view .img_wrapper").width(container_width).height(container_width);

    //---------------------SWIPER---------------------
    $scope.personalSettingSwiper = new Swiper('#personal-settings-swiper', {
        speed: 333,
        onlyExternal: true,
    });
    //---------------------NAVIGATE UTILITY---------------------
    $scope.goToNext = function() {
        $scope.personalSettingSwiper.slideNext(false,333);
        $scope.activeIndex = $scope.personalSettingSwiper.activeIndex;
    };
    $scope.goToPrev = function() {
        $scope.personalSettingSwiper.slidePrev(false,333);
        $scope.activeIndex = $scope.personalSettingSwiper.activeIndex;
    };
    //---------------------HEADER STYLE---------------------
    var forwardHideIndex = [1,3,4];
    $scope.forwardStyle = function() {
        //IF FOUND HIDE
        if (forwardHideIndex.indexOf($scope.activeIndex) >= 0) {
            return {
                display: "none"
            }
        }
    };
    var backHideIndex = [0];
    $scope.backStyle = function() {
        //IF FOUND HIDE
        if (backHideIndex.indexOf($scope.activeIndex) >= 0) {
            $ionicNavBarDelegate.showBackButton(true);
            return {
                display: "none"
            }
        } else {
            $ionicNavBarDelegate.showBackButton(false);
        }
    };

    //---------------------MOMENT---------------------
    function last_day_of_month(moment_date) {
        var last_day = moment_date.add('months', 1).date(1).subtract('days', 1).date();
        return last_day;
    }

    $scope.updateMaxDay = function() {
        $timeout(function(){
            var year = parseInt($("#yearPicker input").val());
            var month = parseInt($("#monthPicker input").val()) - 1;
            var currentDate = moment([year, month, 1]);
            var lastDay = last_day_of_month(currentDate);
            $scope.maxDay = lastDay;

            $timeout(function(){
                var day = parseInt($("#dayPicker input").val());
                var outputMoment = moment([year, month, day]);
            },50);

        },50);
    };
    $scope.updateAge = function() {
        var year = parseInt($("#yearPicker input").val());
        var age = $scope.maxYear - year;
        $scope.updateMaxDay();
        $scope.ageImg = ageIconService.getIcon(age,gender_enum_g[$scope.personal.gender]);
    };
    //$scope.updateHoroscope = function() {
    //    var month = parseInt($("#monthPicker input").val()) - 1;
    //    var day = parseInt($("#dayPicker input").val());
    //    //var momentDate =  moment([2015,month,day]);
    //    $scope.horoscopeImg = horoscopeService.getHoroscope(month,day);
    //    console.log(month);
    //    console.log(day);
    //    console.log($scope.horoscopeImg);
    //};
    $scope.monthFormatter = function(val) {
        return months_enum_g[val];
    };

    //---------------------PERSONAL SETTINGS---------------------
    $scope.setGender = function(gender) {
        $scope.personal.gender = gender;
        $scope.updateAge();
        //$scope.updateHoroscope();
        $scope.goToNext();
    };
    $scope.setSmoker = function(boolean) {
        $scope.personal.smoker = boolean;
        $scope.goToNext();
    };

    //---------------------INIT VAR---------------------
    $scope.initVar = function() {
        $scope.activeIndex = 0;
        $scope.personalSettingSwiper.slideTo(0,0);
        $scope.maxYear = moment().year();
        if (personalDataDbService.profileFound()) {
            $scope.personal = angular.copy(personalDataDbService.getData());
        } else {
            $scope.personal = {
                id          : undefined,
                name        : undefined,
                gender      : undefined,
                smoker      : undefined,
                income      : 0,
                expenditure : 0,
                year        : $scope.maxYear,
                month       : 1,
                day         : 1
            };
        }
    };
    //---------------------SUBMIT---------------------
    $scope.submit = function() {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('Core', "Client's profile", 'Client Add / Client Edit');

        loadingService.show("SUBMITTING");
        var input = {
            id          : $scope.personal.id,
            name        : $scope.personal.name,
            birthday    : moment([$scope.personal.year,$scope.personal.month - 1,$scope.personal.day]).format("LL"),
            gender      : $scope.personal.gender,
            smoker      : $scope.personal.smoker,
            income      : parseInt($scope.personal.income),
            expenditure : parseInt($scope.personal.expenditure),
        };
        for (var key in input) {
            if (key === "id" && input[key] === undefined) {
                delete input[key];
            } else if (isNaN_test(input[key])) {
                input[key] = 0;
            }
        }
        $http.post(ctrl_url + "set_personal_settings", input)
            .success(function(result){
                if (result.status === "success") {
                    personalDataDbService.init().then(function(result){
                        $scope.$broadcast('CLIENTS PROFILE UPDATED');

                        $scope.activeIndex = 0;

                        //NAVIGATE BACK
                        $ionicHistory.goBack();
                        $("#preview_profile_view").scope().initVar();

                        loadingService.hide();
                    });
                } else {
                    errorHandler.handleOthers(result.status);
                }
            });
    };

    //---------------------FORMATTER---------------------
    $scope.formatter = function(modelValue, filter) {
        if (modelValue) {
            var currencyUnit = $translate.instant("CURRENCY");
            return filter("currency")(modelValue,currencyUnit,0);
        }
        return "";
    };
});
