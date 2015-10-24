angular.module('$countdownTimePicker', []).directive('countdownTimePicker', function () {
    return {
        scope: true,
        restrict: 'A',
        require: [],
        template: '',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, $translate, $toast, findParentService, reminderService, utilityService) {

            console.log("COUNTDOWN TIME PICKER");

            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            var container = ".modal .date_picker." + $attrs.name;
            //MAP TYPE -> ARRAY VAR NAME
            var varNameEnum = {
                review      : "review",
                birthday    : "birthday",
                maturity    : "maturityDate",
                countdown   : "countdown"
            };
            function getOrderFromCordovaName(cordovaName) {
                for (var i = 0 ; i < repeatModeEnum.length ; i++) {
                    if (repeatModeEnum[i].cordova === cordovaName) {
                        return repeatModeEnum[i].order;
                        break;
                    }
                }
            }

            if ($attrs.name === "annual") {
                $scope.frequency = getOrderFromCordovaName("year");
            } else if ($attrs.name === "maturity") {
                $scope.frequency = getOrderFromCordovaName("0");
            } else {
                $scope.frequency = getOrderFromCordovaName("0");
            }

            $scope.countdownTimePicker = {};

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
            function pageScroll(initSlide) {
                initSlide = initSlide === undefined ? 0 : initSlide;
                if ($scope.pageSwiper === undefined) {
                    $(container + " .swiper-slide.match-height").height($(container + " .swiper-slide.target-height").height());
                    $scope.pageSwiper = new Swiper(container+".swiper-container", {
                        onlyExternal: true,
                        initialSlide : initSlide
                    });
                } else {
                    $scope.pageSwiper.slideTo(initSlide,0);
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
                //$scope.data = options.data;
                console.log(options);
                $scope.multiple = validity_test(options.placeholder)        ? false        : true;
                $scope.data     = $scope.multiple                           ? options.data : [options.data];
                $scope.new      = validity_test($scope.data[0].reminderSet) ? true         : false;

                var delay_time = utilityService.getKeyboardDelay();
                var init_name      = validity_test(options.placeholder)       ? options.placeholder                            : undefined;
                var init_countdown = validity_test($scope.data.countdownDays) ? get_countdown_index($scope.data.countdownDays) : 0;
                var init_hour      = validity_test($scope.data.dateTime)      ? $scope.data.dateTime.hour()                    : 9;
                var init_freq      = validity_test($scope.data.frequency)     ? $scope.data.frequency                          : $scope.frequency;


                console.log($scope.frequency);
                console.log(init_freq);


                if (!$scope.readOnly) {
                    $timeout(function(){
                        //UPDATE REPEAT MODE
                        $scope.repeatModeIndex = init_freq;
                        $scope.updateRepeatMode();
                        //SHOW MODAL
                        $scope.countdownTimePicker.show();
                        //INIT VALUE
                        if ($scope.multiple) {
                            pageScroll(1);
                        } else {
                            pageScroll();
                        }
                        $(container + " input").val(init_name);
                        $timeout(function(){
                            countdown_scroll(init_countdown);
                            hour_scroll (container,init_hour);
                        },1)
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
                var reminderInputObjArray = [];
                angular.forEach($scope.data, function(data,index) {
                    console.log(data);

                    var countdown = countdown_array_g[parseInt($scope.countdownTimeSwiper.activeIndex)];
                    var hour = parseInt($(container + " .hour .swiper-slide-active").text());
                    var type = data.type;
                    var referenceDate = $scope.new ? data[varNameEnum[data.type]] : data.referenceDate;
                    var output_moment_date = referenceDate.clone().subtract(countdown,'days').hour(hour);
                    if ($scope.multiple) {
                        var reminderName = $translate.instant("ONE_" + type.toUpperCase(),{
                            name    : data.name,
                            company : data.company
                        });
                    } else {
                        var reminderName = $(container + " input").val();
                    }

                    var reminderInputObj = {
                        id            : data.id,
                        name          : reminderName,
                        type          : type,
                        dateTime      : output_moment_date,
                        frequency     : $scope.repeatModeIndex,
                        referenceDate : referenceDate,
                        countdownDays : countdown,
                        data          : data
                    };

                    //IF MULTIPLE WAIT,
                    //ELSE POST DATA IMMEDIATELY
                    if ($scope.multiple) {
                        reminderInputObjArray.push(reminderInputObj);
                    } else {
                        reminderService.add(reminderInputObj).then(function(status){
                            if (status === "OK") {
                                parentScope.closeEverything();
                                $scope.closeCountdownTimePicker();
                            }
                        });
                    }
                });

                if ($scope.multiple) {
                    reminderService.addMultiple(reminderInputObjArray).then(function(status){
                        if (status === "OK") {
                            parentScope.closeEverything();
                            $scope.closeCountdownTimePicker();
                        }
                    });
                }
            };

            $scope.changeRepeatMode = function() {
                $scope.repeatModeIndex = $scope.repeatModeIndex !== undefined ? ($scope.repeatModeIndex + 1)%repeatModeEnum.length : 0 ;
                $scope.updateRepeatMode();
            };
            $scope.updateRepeatMode = function() {
                $scope.repeatModeDisplayed = repeatModeEnum[$scope.repeatModeIndex].translate;
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
                                                        '<md-button class="col align-center bg_gray_color" ng-if="multiple" ng-click="closeCountdownTimePicker()">{{"PICKER_CANCEL" | translate}}</md-button>' +
                                                        '<md-button class="col align-center bg_gray_color" ng-if="!multiple" ng-click="goToSlide(0)">{{"PICKER_BACK" | translate}}</md-button>' +
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