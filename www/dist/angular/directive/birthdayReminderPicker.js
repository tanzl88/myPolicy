angular.module('$birthdayReminderPicker', []).directive('birthdayReminderPicker', function () {
    return {
        scope: true,
        restrict: 'A',
        require: [],
        template: '',
        controller: ['$scope', '$element', '$attrs', '$ionicModal', '$timeout', '$parse', '$state', '$toast', 'findParentService', 'reminderService', 'utilityService', function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, $toast, findParentService, reminderService, utilityService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            var container = ".modal .date_picker." + $attrs.name;
            $scope.dateTimePicker = {};

            // ---------------- DEFAULT ----------------
            $scope.timeScroll   = angular.isDefined($attrs.timeScroll)  ? parse_boolean($attrs.timeScroll)           : true;
            $scope.hourScroll   = angular.isDefined($attrs.hourScroll)  ? parse_boolean($attrs.hourScroll)           : true;


            // ---------------- MODAL FUNCTION ----------------
            parentScope.showDateTimePicker[$attrs.name] = $scope.showDateTimePicker[$attrs.name] = function (id) {
                $scope.editId = validity_test(id) ? id : undefined;
                //HIDE KEYBOARD BEFORE MODAL SHOWN
                var delay_time = utilityService.getKeyboardDelay();
                var init_time = validity_test(init_date_input) ? init_date_input  : moment();
                var init_name = validity_test(init_name_input) ? init_name_input  : undefined;
                var init_hour = validity_test(init_date_input) ? init_date.hour() : 9;
                if (!$scope.readOnly) {
                    $timeout(function(){
                        $scope.dateTimePicker.show();
                        $(container + " input").val(init_name);
                        $(container + " .swiper-slide.match-height").height($(container + " .swiper-slide.target-height").height());

                        pageScroll();
                        if ($scope.yearScroll) year_scroll(container,init_date.year(),minYear,maxYear);
                        if ($scope.monthScroll) month_scroll(container,init_date.month());
                        if ($scope.dayScroll) day_scroll(container,init_date.date());
                        if ($scope.hourScroll) hour_scroll(container,init_hour);
                    },delay_time);
                }
            };

            $scope.closeDateTimePicker = function () {
                $(container + " input").val(undefined);
                $scope.dateTimePicker.hide();
            };

            $scope.$on('$destroy', function (id) {
                console.log("KABOOOOOOM!!!!!!!!!!!!!!!!!");
                $scope.dateTimePicker.remove();
                $scope.pageSwiper       = undefined;
                swiperYear[container]   = undefined;
                swiperMonth[container]  = undefined;
                swiperDay[container]    = undefined;
                swiperHour[container]   = undefined;
            });

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
                var year    = getDateFromSwiper(container,"year");
                var month   = getDateFromSwiper(container,"month");
                var day     = getDateFromSwiper(container,"day");
                var hour    = getDateFromSwiper(container,"hour");
                //SET DATA AND MODEL
                var output_moment_date = moment([year,month - 1,day,hour]);
                reminderService.add($scope.editId,reminderName,"review",output_moment_date).then(function(status){
                    if (status === "OK") $scope.closeDateTimePicker();
                });
            };
            $scope.goToSlide = function(index) {
                var reminderName = $(container + " input").val();
                if (reminderName === "" && index === 1) {
                    $toast.show("REMINDER_NAME_ERROR");
                } else {
                    $scope.pageSwiper.slideTo(index,333);
                }
            };


            var modal_template = '<div class="modal" style="background-color: rgba(0,0,0,0.6)">' +
                                    //'<ion-header-bar class="align-center"><h1 class="title">{{"SELECT_DATE" | translate}}</h1></ion-header-bar>' +
                                    '<div>' +
                                        '<div class="date_picker swiper-container transform-align-middle ' + $attrs.name + '">' +
                                            '<div class="swiper-wrapper">' +
                                                '<div class="swiper-slide match-height">' +
                                                    '<div class="transform-align-middle">' +
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
                                                    '<div class="row picker_header" style="margin-bottom: 0%;">' +
                                                        '<div class="col align-center" ng-if="dayScroll">{{"PICKER_DAY" | translate}}</div>' +
                                                        '<div class="col align-center" ng-if="monthScroll">{{"PICKER_MONTH" | translate}}</div>' +
                                                        '<div class="col align-center" ng-if="yearScroll">{{"PICKER_YEAR" | translate}}</div>' +
                                                        '<div class="col align-center" ng-if="hourScroll">{{"PICKER_TIME" | translate}}</div>' +
                                                    '</div>' +
                                                    '<div class="birthday_divider"></div>' +
                                                    '<div class="row pickerScroll">' +
                                                        '<div class="selector_box"></div>' +
                                                        '<div class="swiper-container day col" ng-if="dayScroll"><div class="swiper-wrapper"></div></div>' +
                                                        '<div class="swiper-container month col" ng-if="monthScroll"><div class="swiper-wrapper"></div></div>' +
                                                        '<div class="swiper-container year col" ng-if="yearScroll"><div class="swiper-wrapper"></div></div>' +
                                                        '<div class="swiper-container hour col" ng-if="hourScroll"><div class="swiper-wrapper"></div></div>' +
                                                    '</div>' +
                                                    '<div class="birthday_divider"></div>' +
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
        }],
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