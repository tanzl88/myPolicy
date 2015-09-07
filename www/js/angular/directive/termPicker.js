angular.module('$termPicker', []).directive('termPicker', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        template: '<input class="align-center bg_color datepicker" type="text" ng-click="showTermPicker()" style="cursor:inherit; width: 100%;" readonly/>',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $interval, $parse, $state, $translate, findParentService, $ionicSlideBoxDelegate, utilityService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            $scope.termPicker = {};
            $scope.pickerMode = true;


            function generateByYearTemplate(minYear,maxYear) {
                var template = "";
                for (var i = minYear ; i < maxYear + 1 ; i++) {
                    var yearTranslate = $translate.instant("YEAR",{
                        year : i
                    },'messageformat');
                    template += '<div class="swiper-slide align-center ' + i + '">' + yearTranslate + '</div>';
                }
                return template;
            }
            function generateByAgeTemplate(minAge,maxAge) {
                var template = "";
                for (var i = minAge ; i < maxAge + 1 ; i++) {
                    var yearTranslate = $translate.instant("YEAR_OLD",{
                        year : i
                    },'messageformat');
                    template += '<div class="swiper-slide align-center ' + i + '">' + yearTranslate + '</div>';
                }
                return template;
            }
            function createNewSwiper(containerName) {
                var swiper = new Swiper(containerName, {
                    direction: "vertical",
                    slidesPerView: 3,
                    initialSlide: 25,
                    centeredSlides: true,
                    spaceBetween: 10,
                    freeMode: true,
                    freeModeMomentumRatio: 0.6,
                    freeModeSticky: true,
                });
                return swiper;
            }

            // ---------------- DEFAULT ----------------
            $scope.readOnly     = angular.isDefined($attrs.readOnly) ? parse_boolean($attrs.readOnly) : false;
            var minYear         = parseInt($attrs.minYear)
            var maxYear         = parseInt($attrs.maxYear);

            // ---------------- MODAL FUNCTION ----------------
            $scope.pickerModeChange = function(speed) {
                var index = $scope.pickerMode ? 0 : 1;
                var speed = validity_test(speed) ? speed : 333;
                var timer = $interval(function(){
                    if (validity_test($ionicSlideBoxDelegate.$getByHandle("termPicker" + $attrs.name).slidesCount())) {
                        $interval.cancel(timer);
                        $ionicSlideBoxDelegate.$getByHandle("termPicker" + $attrs.name).slide(index,speed);
                    }
                },1);
            };
            $scope.showTermPicker = function () {
                //DISABLE USER SLIDES
                $ionicSlideBoxDelegate.$getByHandle("termPicker" + $attrs.name).enableSlide(false);

                //HIDE KEYBOARD BEFORE MODAL SHOWN
                var delay_time = utilityService.getKeyboardDelay();
                var model = $parse($attrs.ngModelName)(parentScope);
                var initValueYear = validity_test(model) ? model : 25;
                var initValueAge  = validity_test(model) ? model : 99;
                var mode = $parse($attrs.ngModelName + "Mode")(parentScope);
                $scope.pickerMode = validity_test(mode) ? mode : true;
                if (!$scope.readOnly) {
                    $timeout(function(){
                        //INIT PICKER MODE
                        //$timeout(function(){
                            $scope.pickerModeChange(0);
                        //},666);

                        //SHOW MODAL
                        $scope.termPicker.show();
                        var container = ".modal .term_picker." + $attrs.name;
                        var year_swiper_wrapper = $(container + " .year .swiper-wrapper");
                        $(year_swiper_wrapper).html(generateByYearTemplate(minYear,maxYear));
                        if ($scope.yearSwiper) {
                            $scope.yearSwiper.update();
                            $scope.yearSwiper.slideTo(initValueYear - minYear,0);
                        } else {
                            $scope.yearSwiper = createNewSwiper(container + ' .year');
                            $scope.yearSwiper.slideTo(initValueYear - minYear,0);
                        }

                        var age_swiper_wrapper = $(container + " .age .swiper-wrapper");
                        $(age_swiper_wrapper).html(generateByAgeTemplate(1,150));
                        if ($scope.ageSwiper) {
                            $scope.ageSwiper.update();
                            $scope.ageSwiper.slideTo(initValueAge - 1,0);
                        } else {
                            $scope.ageSwiper = createNewSwiper(container + ' .age');
                            $scope.ageSwiper.slideTo(initValueAge - 1,0);
                        }


                    },delay_time);
                }
            };

            $scope.closeTermPicker = function () {
                $scope.termPicker.hide();
            };

            $scope.$on('$destroy', function (id) {
                console.log("TERM PICKER DESTROY");
                $scope.termPicker.remove();
            });

            $scope.clickDone = function() {
                var container = ".modal .term_picker." + $attrs.name;
                var yearText = $scope.pickerMode ? $(container + " .year .swiper-slide-active").text() : $(container + " .age .swiper-slide-active").text();
                $parse($attrs.ngModelName).assign(parentScope, parseInt(yearText));
                $parse($attrs.ngModelName + "Mode").assign(parentScope, $scope.pickerMode);
                $parse($attrs.ngModelName + "Displayed").assign(parentScope, yearText);
                $scope.closeTermPicker();
            };




            var modal_template = '<div class="modal" style="background-color: rgba(0,0,0,0.6)">' +
                                    '<div>' +
                                        '<div class="term_picker  transform-align-middle ' + $attrs.name + '">' +
                                            '<div class="row picker_header">' +
                                                '<toggle-switch ng-model="$parent.$parent.pickerMode" ng-change="pickerModeChange()" on-label="{{\'BY_YEAR\' | translate}}" off-label="{{\'BY_AGE\' | translate}}"><toggle-switch>' +
                                                //'<div class="col align-center">{{"PICKER_YEAR" | translate}}</div>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row pickerScroll">' +
                                                '<div class="selector_box"></div>' +
                                                '<ion-slide-box delegate-handle="termPicker' + $attrs.name + '" on-slide-changed="slideHasChanged($index)" style="width: 100%;">' +
                                                    '<ion-slide>' +
                                                        '<div class="swiper-container year col"><div class="swiper-wrapper"></div></div>' +
                                                    '</ion-slide>' +
                                                    '<ion-slide>' +
                                                        '<div class="swiper-container age col inline-block align-middle"><div class="swiper-wrapper"></div></div>' +
                                                    '</ion-slide>' +
                                                '</ion-slide-box>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row picker_buttons"><div class="col align-center" ng-click="closeTermPicker()">{{"PICKER_CANCEL" | translate}}</div><div class="col align-center" ng-click="clickDone()">{{"PICKER_DONE" | translate}}</div></div>' +
                                        '</div>' +
                                    '</div>' +
                                 '</div>';
            $scope.termPicker = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
        },
        compile: function ($element, $attrs, $scope) {
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            var input = $element.find('input');
            angular.forEach({
                'name': $attrs.name,
                //'placeholder': $attrs.ngPlaceholder,
                'ng-model': $attrs.ngModelName + "Displayed"
            }, function (value, name) {
                if (angular.isDefined(value)) {
                    input.attr(name, value);
                }
            });
        }
    };
});