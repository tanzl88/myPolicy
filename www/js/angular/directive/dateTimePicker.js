angular.module('$dateTimePicker', []).directive('dateTimePicker', function () {
    return {
        scope: true,
        restrict: 'A',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        //template: '<input class="align-center bg_color datepicker" type="text" ng-click="showDateTimePicker()" style="cursor:inherit; width: 100%;" readonly/>',
        //template: '<ion-item class="reminder_menu_item" ng-click="showDateTimePicker()">Review reminder</ion-item>',
        template: '',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, $toast, findParentService, reminderService, utilityService) {

            console.log("INITIATING DATE TIME PICKER");

            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            var container = ".modal .date_picker." + $attrs.name;
            $scope.dateTimePicker = {};
            $scope.mode = $attrs.name;
            $scope.type = $attrs.type;

            // ---------------- DEFAULT ----------------
            $scope.yearScroll   = angular.isDefined($attrs.yearScroll)  ? parse_boolean($attrs.yearScroll)           : true;
            $scope.monthScroll  = angular.isDefined($attrs.monthScroll) ? parse_boolean($attrs.monthScroll)          : true;
            $scope.dayScroll    = angular.isDefined($attrs.dayScroll)   ? parse_boolean($attrs.dayScroll)            : true;
            $scope.hourScroll   = angular.isDefined($attrs.hourScroll)  ? parse_boolean($attrs.hourScroll)           : true;
            $scope.repeatMode   = angular.isDefined($attrs.repeatMode)  ? parse_boolean($attrs.repeatMode)           : true;
            var minYear         = angular.isDefined($attrs.minYear)     ? parseInt($attrs.minYear)                   : moment().year();
            var maxYear         = angular.isDefined($attrs.maxYear)     ? moment().year() + parseInt($attrs.maxYear) : moment().year();

            // ---------------- SLIDE ----------------
            function pageScroll() {
                if ($scope.pageSwiper === undefined) {
                    $(container + " .swiper-slide.match-height").height($(container + " .swiper-slide.target-height").height());
                    $scope.pageSwiper = new Swiper(container+".swiper-container", {
                        onlyExternal: true,
                    });
                } else {
                    $scope.pageSwiper.slideTo(0,0);
                }
            }
            $scope.goToSlide = function(index) {
                var reminderName = $(container + " input").val();
                if (reminderName === "" && index === 1) {
                    $toast.show("REMINDER_NAME_ERROR");
                } else {
                    $scope.pageSwiper.slideTo(index,333);
                }
            };

            // ---------------- MODAL FUNCTION ----------------
            parentScope.showDateTimePicker[$attrs.name] = $scope.showDateTimePicker = function (init_name_input,init_date_input,id,init_freq_input) {
                $scope.editId = validity_test(id) ? id : undefined;
                //HIDE KEYBOARD BEFORE MODAL SHOWN
                var delay_time = utilityService.getKeyboardDelay();
                var init_date = validity_test(init_date_input) ? init_date_input  : moment();
                var init_name = validity_test(init_name_input) ? init_name_input  : undefined;
                var init_hour = validity_test(init_date_input) ? init_date.hour() : 9;
                var init_freq = validity_test(init_freq_input) ? init_freq_input  : 1;

                if (!$scope.readOnly) {
                    $timeout(function(){
                        //UPDATE REPEAT MODE
                        $scope.repeatModeIndex = init_freq;
                        $scope.updateRepeatMode();

                        $scope.dateTimePicker.show();
                        $(container + " input").val(init_name);

                        pageScroll();
                        $timeout(function(){
                            if ($scope.yearScroll)  year_scroll (container,init_date.year(),minYear,maxYear);
                            if ($scope.monthScroll) month_scroll(container,init_date.month());
                            if ($scope.dayScroll)   day_scroll  (container,init_date.date());
                            if ($scope.hourScroll)  hour_scroll (container,init_hour);
                        },666)
                    },delay_time);
                }
            };

            $scope.closeDateTimePicker = function () {
                $scope.dateTimePicker.hide();
                $timeout(function(){
                    $(container + " input").val(undefined);
                },200);
            };

            $scope.$on('$destroy', function (id) {
                console.log("REMINDER PICKER DESTROY");
                $scope.dateTimePicker.remove();
                $scope.pageSwiper       = undefined;
                swiperYear[container]   = undefined;
                swiperMonth[container]  = undefined;
                swiperDay[container]    = undefined;
                swiperHour[container]   = undefined;
            });

            // ---------------- DONE AND DATA PROCESSING ----------------
            function getDateFromSwiper(container,type) {
                if ($scope[type + "Scroll"]) {
                    return parseInt($(container + " ." + type + " .swiper-slide-active").text());
                } else {
                    var defaultValue = type === "year" ? 1950 : 1;
                    return defaultValue;
                }
            }
            function getFormatFromSwiper(container) {
                var format = $(container + " .format .swiper-slide-active").text();
                var formatIndex = 0;
                if (format === "PM") formatIndex = 1;
                return formatIndex;
            }
            $scope.clickDone = function() {
                var reminderName = $(container + " input").val();
                var repeatMode   = $scope.repeatModeIndex;
                var year    = getDateFromSwiper(container,"year");
                var month   = getDateFromSwiper(container,"month");
                var day     = getDateFromSwiper(container,"day");
                var hour    = getDateFromSwiper(container,"hour");
                //SET DATA AND MODEL
                var output_moment_date = moment([year,month - 1,day,hour,0,0]);
                reminderService.add($scope.editId,reminderName,$scope.type,output_moment_date,repeatMode).then(function(status){
                    if (status === "OK") {
                        parentScope.closeEverything();
                        $scope.closeDateTimePicker();
                    }
                });
            };

            $scope.changeRepeatMode = function() {
                $scope.repeatModeIndex = $scope.repeatModeIndex !== undefined ? ($scope.repeatModeIndex + 1)%repeat_mode_g.length : 0 ;
                $scope.updateRepeatMode();
            };
            $scope.updateRepeatMode = function() {
                $scope.repeatModeDisplayed = repeat_mode_g[$scope.repeatModeIndex];
            };


            var modal_template = '<div class="modal" style="background-color: rgba(0,0,0,0.6)">' +
                                    //'<ion-header-bar class="align-center"><h1 class="title">{{"SELECT_DATE" | translate}}</h1></ion-header-bar>' +
                                    '<div>' +
                                        '<div class="date_picker dateTime swiper-container transform-align-middle ' + $attrs.name + '">' +
                                            '<div class="swiper-wrapper">' +

                                                '<div class="swiper-slide match-height">' +
                                                    '<div class="transform-align-middle">' +
                                                        '<div class="repeat-container has-shadow align-center" ng-click="changeRepeatMode()" ng-if="repeatMode">{{repeatModeDisplayed | translate}}</div>' +
                                                        '<p class="msg align-center" style="font-weight: bold;">{{"CREATE_NEW_REMINDER" | translate}}</p>' +
                                                        //'<p class="msg">{{"REMINDER_NAME_MSG" | translate}}</p>' +
                                                        '<input class="form-group bg_color align-center" type="text" name="reminderName" placeholder="{{\'REMINDER_NAME\' | translate}}" ng-model="reminderName" >' +
                                                        '<div class="row picker_buttons">' +
                                                            '<div class="col align-center" ng-click="closeDateTimePicker()">{{"PICKER_CANCEL" | translate}}</div>' +
                                                            '<div class="col align-center" ng-click="goToSlide(1)">{{"PICKER_NEXT" | translate}}</div>' +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +


                                                '<div class="swiper-slide target-height">' +

                                                    //'<div class="repeat-container" ng-click="changeRepeatMode()">{{repeatMode | translate}}</div>' +

                                                    '<div class="row picker_header" style="margin-bottom: 0%;">' +
                                                        '<div class="col align-center" ng-if="dayScroll">{{"PICKER_DAY" | translate}}</div>' +
                                                        '<div class="col align-center" ng-if="monthScroll">{{"PICKER_MONTH" | translate}}</div>' +
                                                        '<div class="col align-center" ng-if="yearScroll">{{"PICKER_YEAR" | translate}}</div>' +
                                                        '<div class="col align-center" ng-if="hourScroll">{{"PICKER_TIME" | translate}}</div>' +
                                                    '</div>' +
                                                    //'<div class="birthday_divider"></div>' +
                                                    '<div class="row pickerScroll">' +
                                                        '<div class="selector_box"></div>' +
                                                        '<div class="swiper-container day col" ng-if="dayScroll"><div class="swiper-wrapper"></div></div>' +
                                                        '<div class="swiper-container month col" ng-if="monthScroll"><div class="swiper-wrapper"></div></div>' +
                                                        '<div class="swiper-container year col" ng-if="yearScroll"><div class="swiper-wrapper"></div></div>' +
                                                        '<div class="swiper-container hour col" ng-if="hourScroll"><div class="swiper-wrapper"></div></div>' +
                                                    '</div>' +
                                                    //'<div class="birthday_divider"></div>' +

                                                    //'<div class="birthday_divider"></div>' +
                                                    '<div class="row picker_buttons">' +
                                                        '<div class="col align-center" ng-click="goToSlide(0)">{{"PICKER_BACK" | translate}}</div>' +
                                                        '<div class="col align-center" ng-click="clickDone()">{{"PICKER_DONE" | translate}}</div>' +
                                                    '</div>' +
                                                '</div>' +

                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                 '</div>';
            $scope.dateTimePicker = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
            $($scope.dateTimePicker.$el).css("z-index",50);
        },
        compile: function ($element, $attrs) {
            //$element.attr("ng-click","showDateTimePicker()");
            //$element.attr("ng-dummy","XYZ");
            //console.log($element);
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            //var input = $element.find('input');
            //angular.forEach({
            //    'name': $attrs.name,
            //    //'placeholder': $attrs.ngPlaceholder,
            //    'ng-model': $attrs.ngModelName
            //}, function (value, name) {
            //    if (angular.isDefined(value)) {
            //        input.attr(name, value);
            //    }
            //});
        }
    };
});