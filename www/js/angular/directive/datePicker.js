angular.module('$datePicker', []).directive('datePicker', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        template: '<input class="align-center bg_color datepicker" type="text" ng-click="showDatePicker()" style="cursor:inherit; width: 100%;" readonly/>',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, findParentService, utilityService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            var container = ".modal .date_picker." + $attrs.name;
            $scope.datePicker = {};

            // ---------------- DEFAULT ----------------
            $scope.yearScroll   = angular.isDefined($attrs.yearScroll) ? parse_boolean($attrs.yearScroll) : true;
            $scope.monthScroll  = angular.isDefined($attrs.monthScroll) ? parse_boolean($attrs.monthScroll) : true;
            $scope.dayScroll    = angular.isDefined($attrs.dayScroll) ? parse_boolean($attrs.dayScroll) : true;
            $scope.readOnly     = angular.isDefined($attrs.readOnly) ? parse_boolean($attrs.readOnly) : false;
            var minYear         = angular.isDefined($attrs.minYear) ? parseInt($attrs.minYear) : moment().year();
            var maxYear         = angular.isDefined($attrs.maxYear) ? moment().year() + parseInt($attrs.maxYear) : moment().year();

            // ---------------- MODAL FUNCTION ----------------
            $scope.showDatePicker = function () {
                //HIDE KEYBOARD BEFORE MODAL SHOWN
                var delay_time = utilityService.getKeyboardDelay();

                var model = $parse($attrs.ngModelName)(parentScope);
                var init_date = validity_test(model) ? moment(model,$attrs.dateFormat) : moment();
                if (!$scope.readOnly) {
                    $timeout(function(){
                        $scope.datePicker.show();
                        if ($scope.yearScroll) year_scroll(".modal .date_picker." + $attrs.name,init_date.year(),minYear,maxYear);
                        if ($scope.monthScroll) month_scroll(".modal .date_picker." + $attrs.name,init_date.month());
                        if ($scope.dayScroll) day_scroll(".modal .date_picker." + $attrs.name,init_date.date());
                    },delay_time);
                }
            };

            $scope.closeDatePicker = function () {
                $scope.datePicker.hide();
            };

            $scope.$on('$destroy', function (id) {
                console.log("DATE PICKER " + container + " DESTROY");
                $scope.datePicker.remove();
                swiperYear[container]  = undefined;
                swiperMonth[container] = undefined;
                swiperDay[container]   = undefined;
            });

            function getDateFromSwiper(container,type) {
                if ($scope[type + "Scroll"]) {
                    return $(container + " ." + type + " .swiper-slide-active").text();
                } else {
                    var defaultValue = type === "year" ? 1950 : 1;
                    return defaultValue;
                }
            }
            $scope.clickDone = function() {
                var year = getDateFromSwiper(container,"year");
                var month = getDateFromSwiper(container,"month");
                var day = getDateFromSwiper(container,"day");
                //SET DATA AND MODEL
                var output_moment_date = moment([year,month - 1,day]);
                var output_date = output_moment_date.format($attrs.dateFormat);
                $parse($attrs.ngModelName).assign(parentScope, output_date);
                $scope.closeDatePicker();
            };


            var modal_template = '<div class="modal" style="background-color: rgba(0,0,0,0.6)">' +
                                    //'<ion-header-bar class="align-center"><h1 class="title">{{"SELECT_DATE" | translate}}</h1></ion-header-bar>' +
                                    '<div>' +
                                        '<div class="date_picker  transform-align-middle ' + $attrs.name + '">' +
                                            '<div class="row picker_header">' +
                                                '<div class="col align-center" ng-if="dayScroll">{{"PICKER_DAY" | translate}}</div>' +
                                                '<div class="col align-center" ng-if="monthScroll">{{"PICKER_MONTH" | translate}}</div>' +
                                                '<div class="col align-center" ng-if="yearScroll">{{"PICKER_YEAR" | translate}}</div>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row pickerScroll">' +
                                                '<div class="selector_box"></div>' +
                                                '<div class="swiper-container day col" ng-if="dayScroll"><div class="swiper-wrapper"></div></div>' +
                                                '<div class="swiper-container month col" ng-if="monthScroll"><div class="swiper-wrapper"></div></div>' +
                                                '<div class="swiper-container year col" ng-if="yearScroll"><div class="swiper-wrapper"></div></div>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row picker_buttons"><div class="col align-center" ng-click="closeDatePicker()">{{"PICKER_CANCEL" | translate}}</div><div class="col align-center" ng-click="clickDone()">{{"PICKER_DONE" | translate}}</div></div>' +
                                        '</div>' +
                                    '</div>' +
                                 '</div>';
            $scope.datePicker = $ionicModal.fromTemplate(modal_template, {
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
                'ng-model': $attrs.ngModelName,
                'required' : $attrs.required
            }, function (value, name) {
                if (angular.isDefined(value)) {
                    input.attr(name, value);
                }
            });
        }
    };
});