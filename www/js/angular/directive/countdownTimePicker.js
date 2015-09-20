angular.module('$countdownTimePicker', []).directive('countdownTimePicker', function () {
    return {
        scope: true,
        restrict: 'A',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        //template: '<input class="align-center bg_color datepicker" type="text" ng-click="showCountdownTimePicker()" style="cursor:inherit; width: 100%;" readonly/>',
        //template: '<ion-item class="reminder_menu_item" ng-click="showCountdownTimePicker()">Review reminder</ion-item>',
        template: '',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, $translate, $toast, findParentService, reminderService, utilityService) {

            console.log("COUNTDOWN TIME PICKER");

            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            var container = ".modal .date_picker." + $attrs.name;
            if ($attrs.name === "birthday") {
                $scope.frequency = "year";
            } else if ($attrs.name === "maturity") {
                $scope.frequency = "0";
            } else {
                $scope.frequency = "0";
            }

            $scope.countdownTimePicker = {};
            //$scope.mode = $attrs.name;
            //$scope.type = $attrs.type;

            // ---------------- DEFAULT ----------------
            $scope.repeatMode = angular.isDefined($attrs.repeatMode) ? parse_boolean($attrs.repeatMode) : true;

            //COUNTDOWN DATA
            function get_countdown_template() {
                //TRANSFORM CLOSE DAYS TO START FROM ZERO
                var template = "";
                angular.forEach(countdown_array_g,function(day,index){
                    template += '<div class="swiper-slide align-center ' + day + '">' + $translate.instant("COUNTDOWN_DAY",{"day" : day},'messageformat') + '</div>';
                });
                return template;
            }
            function get_countdown_index(countdown) {
                for (var i = 0 ; i < countdown_array_g.length ; i++) {
                    if (countdown_array_g[i] === countdown) {
                        return i;
                    }
                }
            }
            function get_countdown_days(reminder_date,reference_date) {
                var reminder_date_day = moment([2015,reminder_date.month(),reminder_date.date()]);
                var reference_date_day = moment([2015,reference_date.month(),reference_date.date()]);
                return reference_date_day.diff(reminder_date_day,"days");
            }
            function countdown_scroll(init_countdown) {
                if ($scope.countdownTimeSwiper === undefined) {
                    $(".countdown .swiper-wrapper",container).html(get_countdown_template());
                    $scope.countdownTimeSwiper = new Swiper(container + ' .countdown', {
                        direction: "vertical",
                        slidesPerView: 3,
                        initialSlide: init_countdown,
                        centeredSlides: true,
                        spaceBetween: 10,
                        freeMode: true,
                        freeModeMomentumRatio: 0.6,
                        freeModeSticky: true
                    });
                } else {
                    $scope.countdownTimeSwiper.slideTo(init_countdown,0);
                    $scope.countdownTimeSwiper.update();
                }
            }

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
                    $timeout(function(){
                        $scope.pageSwiper.slideTo(index,333);
                    },100);
                }
            };

            // ---------------- MODAL FUNCTION ----------------
            parentScope.showCountdownTimePicker[$attrs.name] = $scope.showCountdownTimePicker = function(options) {
                $scope.data = options.data;
                var delay_time = utilityService.getKeyboardDelay();
                var init_name      = validity_test(options.placeholder)       ? options.placeholder                            : undefined;
                var init_countdown = validity_test($scope.data.countdownDays) ? get_countdown_index($scope.data.countdownDays) : 0;
                var init_hour      = validity_test($scope.data.dateTime)      ? $scope.data.dateTime.hour()                    : 9;
                var init_freq      = validity_test($scope.data.frequency)     ? $scope.data.frequency                          : $scope.frequency;


                if (!$scope.readOnly) {
                    $timeout(function(){
                        //UPDATE REPEAT MODE
                        $scope.repeatModeIndex = init_freq;
                        $scope.updateRepeatMode();
                        //SHOW MODAL
                        $scope.countdownTimePicker.show();
                        //INIT VALUE
                        pageScroll();
                        $(container + " input").val(init_name);
                        $timeout(function(){
                            countdown_scroll(init_countdown);
                            hour_scroll (container,init_hour);
                        },666)
                    },delay_time);
                }
            };

            $scope.closeCountdownTimePicker = function () {
                $scope.countdownTimePicker.hide();
                $timeout(function(){
                    $(container + " input").val(undefined);
                },200);
            };

            $scope.$on('$destroy', function (id) {
                console.log("REMINDER PICKER DESTROY");
                $scope.countdownTimePicker.remove();
                $scope.pageSwiper          = undefined;
                swiperCountdown[container] = undefined;
                swiperHour[container]      = undefined;
            });

            // ---------------- DONE AND DATA PROCESSING ----------------
            $scope.clickDone = function() {
                var reminderName = $(container + " input").val();
                var countdown = countdown_array_g[parseInt($scope.countdownTimeSwiper.activeIndex)];
                var hour  = parseInt($(container + " .hour .swiper-slide-active").text());

                //SET DATA AND MODEL
                if (validity_test($scope.data.birthday)) {
                    var referenceDate = $scope.data.birthday;
                    var type = "birthday";
                    var reminderDate = referenceDate.clone().subtract(countdown,'days');
                    var output_moment_date = moment([2015,reminderDate.month(),reminderDate.date(),hour,0,0]);
                } else if (validity_test($scope.data.maturityDate)) {
                    var referenceDate = $scope.data.maturityDate;
                    var type = "maturity";
                    var output_moment_date = referenceDate.clone().subtract(countdown,'days').hour(hour);
                } else {
                    var referenceDate = $scope.data.referenceDate;
                    var type = $scope.data.type;
                    if (type === "birthday") {
                        var reminderDate = referenceDate.clone().subtract(countdown, 'days');
                        var output_moment_date = moment([2015, reminderDate.month(), reminderDate.date(), hour, 0, 0]);
                    } else {
                        var output_moment_date = referenceDate.clone().subtract(countdown,'days').hour(hour);
                    }
                }

                var reminderInputObj = {
                    id            : $scope.data.id,
                    name          : reminderName,
                    type          : type,
                    dateTime      : output_moment_date,
                    frequency     : $scope.repeatModeIndex,
                    referenceDate : referenceDate,
                    countdownDays : countdown,
                    data          : $scope.data
                };

                reminderService.add(reminderInputObj).then(function(status){
                    if (status === "OK") {
                        parentScope.closeEverything();
                        $scope.closeCountdownTimePicker();
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
                                    '<div>' +
                                        '<div class="date_picker dateTime swiper-container transform-align-middle ' + $attrs.name + '">' +
                                            '<div class="swiper-wrapper">' +

                                                '<div class="swiper-slide match-height">' +
                                                    '<div class="transform-align-middle">' +
                                                        '<p class="msg align-center" style="font-weight: bold;">{{"CREATE_NEW_REMINDER" | translate}}</p>' +
                                                        '<input class="form-group bg_color align-center" type="text" name="reminderName" placeholder="{{\'REMINDER_NAME\' | translate}}" ng-model="reminderName" >' +
                                                        '<div class="row picker_buttons">' +
                                                            '<md-button class="col align-center bg_gray_color" ng-click="closeCountdownTimePicker()">{{"PICKER_CANCEL" | translate}}</md-button>' +
                                                            '<md-button class="col align-center bg_theme_color" ng-click="goToSlide(1)">{{"PICKER_NEXT" | translate}}</md-button>' +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +


                                                '<div class="swiper-slide target-height">' +
                                                    '<div class="row picker_header" style="margin-bottom: 0%;">' +
                                                        '<div class="col align-center">{{"PICKER_DAY" | translate}}</div>' +
                                                        '<div class="col align-center">{{"PICKER_TIME" | translate}}</div>' +
                                                    '</div>' +
                                                    '<div class="row pickerScroll">' +
                                                        '<div class="selector_box"></div>' +
                                                        '<div class="swiper-container countdown col"><div class="swiper-wrapper"></div></div>' +
                                                        '<div class="swiper-container hour col"><div class="swiper-wrapper"></div></div>' +
                                                    '</div>' +
                                                    '<div class="row picker_buttons">' +
                                                        '<md-button class="col align-center bg_gray_color" ng-click="goToSlide(0)">{{"PICKER_BACK" | translate}}</md-button>' +
                                                        '<md-button class="col align-center bg_theme_color" ng-click="clickDone()">{{"PICKER_DONE" | translate}}</md-button>' +
                                                    '</div>' +
                                                '</div>' +

                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                 '</div>';
            $scope.countdownTimePicker = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
            $($scope.countdownTimePicker.$el).css("z-index",50);
        },
        compile: function ($element, $attrs) {
            //$element.attr("ng-click","showCountdownTimePicker()");
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