angular.module('ui.bootstrap-slider', [])
    .directive('slider', ['$parse', '$timeout', '$rootScope', function ($parse, $timeout, $rootScope) {
        return {
            restrict: 'AE',
            replace: true,
            template: '<div><input class="slider-input" type="text" /></div>',
            require: 'ngModel',
            scope: {
                max: "=",
                min: "=",
                step: "=",
                value: "=",
                ngModel: '=',
                ngDisabled: '=',
                range: '=',
                sliderid: '=',
                ticks: '=',
                ticksLabels: '=',
                scale: '=',
                formatter: '&',
                onStartSlide: '&',
                onStopSlide: '&',
                onSlide: '&'
            },
            link: function ($scope, element, attrs, ngModelCtrl, $compile) {
                $scope.$parent.$parent.sliderScope = $scope;
                var ngModelDeregisterFn, ngDisabledDeregisterFn;

                initSlider();

                function initSlider() {
                    var options = {};

                    function setOption(key, value, defaultValue) {
                        options[key] = value || defaultValue;
                    }

                    function setFloatOption(key, value, defaultValue) {
                        options[key] = value ? parseFloat(value) : defaultValue;
                    }

                    function setBooleanOption(key, value, defaultValue) {
                        options[key] = value ? value + '' === 'true' : defaultValue;
                    }

                    function getArrayOrValue(value) {
                        return (angular.isString(value) && value.indexOf("[") === 0) ? angular.fromJson(value) : value;
                    }

                    setOption('id', $scope.sliderid);
                    setOption('orientation', attrs.orientation, 'horizontal');
                    setOption('selection', attrs.selection, 'before');
                    setOption('handle', attrs.handle, 'round');
                    setOption('tooltip', attrs.sliderTooltip || attrs.tooltip, 'show');
                    setOption('tooltipseparator', attrs.tooltipseparator, ':');
                    setOption('ticks', $scope.ticks);
                    setOption('ticks_labels', $scope.ticksLabels);
                    setOption('scale', $scope.scale, 'linear');

                    setFloatOption('min', $scope.min, 0);
                    setFloatOption('max', $scope.max, 10);
                    setFloatOption('step', $scope.step, 1);
                    var strNbr = options.step + '';
                    var decimals = strNbr.substring(strNbr.lastIndexOf('.') + 1);
                    setFloatOption('precision', attrs.precision, decimals);

                    setBooleanOption('tooltip_split', attrs.tooltipsplit, false);
                    setBooleanOption('enabled', attrs.enabled, true);
                    setBooleanOption('naturalarrowkeys', attrs.naturalarrowkeys, false);
                    setBooleanOption('reversed', attrs.reversed, false);

                    setBooleanOption('range', $scope.range, false);
                    if (options.range) {
                        if (angular.isArray($scope.value)) {
                            options.value = $scope.value;
                        }
                        else if (angular.isString($scope.value)) {
                            options.value = getArrayOrValue($scope.value);
                            if (!angular.isArray(options.value)) {
                                var value = parseFloat($scope.value);
                                if (isNaN(value)) value = 5;

                                if (value < $scope.min) {
                                    value = $scope.min;
                                    options.value = [value, options.max];
                                }
                                else if (value > $scope.max) {
                                    value = $scope.max;
                                    options.value = [options.min, value];
                                }
                                else {
                                    options.value = [options.min, options.max];
                                }
                            }
                        }
                        else {
                            options.value = [options.min, options.max]; // This is needed, because of value defined at $.fn.slider.defaults - default value 5 prevents creating range slider
                        }
                        $scope.ngModel = options.value; // needed, otherwise turns value into [null, ##]
                    }
                    else {
                        setFloatOption('value', $scope.value, 5);
                    }

                    if ($scope.formatter) options.formatter = $scope.$eval($scope.formatter);

                    var slider = $(element).find(".slider-input").eq(0);

                    // check if slider jQuery plugin exists
                    if ($.fn.slider) {
                        // adding methods to jQuery slider plugin prototype
                        $.fn.slider.constructor.prototype.disable = function () {
                            this.picker.off();
                        };
                        $.fn.slider.constructor.prototype.enable = function () {
                            this.picker.on();
                        };

                        // destroy previous slider to reset all options
                        if(slider.data("slider"))
                            slider.slider('destroy');

                        slider.slider(options);
                        $scope.slider = slider;

                        // everything that needs slider element
                        var updateEvent = getArrayOrValue(attrs.updateevent);
                        if (angular.isString(updateEvent)) {
                            // if only single event name in string
                            updateEvent = [updateEvent];
                        }
                        else {
                            // default to slide event
                            updateEvent = ['slide'];
                        }
                        angular.forEach(updateEvent, function (sliderEvent) {
                            slider.on(sliderEvent, function (ev) {
                                ngModelCtrl.$setViewValue(ev.value);
                                $timeout(function () {
                                    $scope.$apply();
                                });
                            });
                        });
                        slider.on('change', function (ev) {
                            ngModelCtrl.$setViewValue(ev.value.newValue);
                            $timeout(function () {
                                $scope.$apply();
                            });
                        });

                        // Event listeners
                        var sliderEvents = {
                            slideStart: 'onStartSlide',
                            slide: 'onSlide',
                            slideStop: 'onStopSlide'
                        };
                        angular.forEach(sliderEvents, function (sliderEventAttr, sliderEvent) {
                            slider.on(sliderEvent, function () {
                                if ($scope[sliderEventAttr]) {
                                    if ($rootScope.$$phase) {
                                        $scope.$evalAsync($scope[sliderEventAttr]);
                                    } else {
                                        $scope.$apply($scope[sliderEventAttr]);
                                    }
                                }
                            });
                        });

                        // deregister ngDisabled watcher to prevent memory leaks
                        if (angular.isFunction(ngDisabledDeregisterFn)) {
                            ngDisabledDeregisterFn();
                            ngDisabledDeregisterFn = null;
                        }

                        ngDisabledDeregisterFn = $scope.$watch('ngDisabled', function (value) {
                            if (value) {
                                slider.slider('disable');
                            }
                            else {
                                slider.slider('enable');
                            }
                        });

                        // deregister ngModel watcher to prevent memory leaks
                        if (angular.isFunction(ngModelDeregisterFn)) ngModelDeregisterFn();
                        ngModelDeregisterFn = $scope.$watch('ngModel', function (value) {
                            if($scope.range){
                                slider.slider('setValue', value);
                            }else{
                                slider.slider('setValue', parseFloat(value));
                            }
                        }, true);
                    }
                }

                var watchers = ['min', 'max', 'step', 'range', 'scale'];
                angular.forEach(watchers, function (prop) {
                    $scope.$watch(prop, function () {
                        initSlider();
                    });
                });
            }
        };
    }])
;
