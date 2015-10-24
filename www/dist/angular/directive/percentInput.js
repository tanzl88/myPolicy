angular.module('$percentInput', []).directive('percentInput', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        template:   '<input class="align-middle align-center bg_color number" type="number" ng-change="calcShortTermAdjustedRate(); calcLongTermAdjustedRate();" pattern="[0-9]+([\.|,][0-9]+)?" step="0.1" ng-class="{\'front\' : state === \'input\'}" ng-keydown="goToNext($event)" ng-blur="inputNumberBlur($event)">' +
                    '<input class="align-middle align-center bg_color text" type="text" ng-change="calcShortTermAdjustedRate(); calcLongTermAdjustedRate();" ng-class="{\'front\' : state !== \'input\'}"' +
                    'model-format="currency" formatter="Percentformatter($modelValue,$filter);" readonly ng-click="triggerNumpad()">',
        controller: ['$scope', '$element', '$attrs', '$ionicModal', '$timeout', '$interval', '$parse', '$state', 'findParentService', function ($scope, $element, $attrs, $ionicModal, $timeout, $interval, $parse, $state, findParentService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            var numberInput = $element.find('input.number');
            var decimal = validity_test($attrs.decimal) ? $attrs.decimal : 1;
            //$scope.state = "show";

            $scope.triggerNumpad = function() {
                $scope.state = "input";

                var focusTimer = $interval(function(){
                    if ($(numberInput).css("display") !== "none") {
                        $(numberInput).val($parse($attrs.ngModelName)(parentScope));
                        numberInput.focus();
                        $interval.cancel(focusTimer);
                    }
                },333);
            };


            $scope.inputNumberBlur = function(event) {
                $scope.state = "show";
                var roundedValue = $(numberInput).val() === "" ? 0 : parseFloat(parseFloat($(numberInput).val()).toFixed(decimal));
                $(numberInput).val("");
                $parse($attrs.ngModelName).assign(parentScope, roundedValue);
            };

            $scope.goToNext = function(event) {
                if (event.which === 9) {
                    event.preventDefault();
                    var parentEl = event.currentTarget.parentElement.parentElement;
                    var siblingEl = parentEl.nextElementSibling;
                    var inputEl = $(siblingEl).find("input.text");
                    if (inputEl.length > 0) {
                        $timeout(function(){
                            angular.element(inputEl).trigger("click");
                        },100);
                    }
                    $(numberInput).blur();
                }
            };

        }],
        compile: function ($element, $attrs) {
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            var input = $element.find('input.text');
            var decimal = validity_test($attrs.decimal) ? $attrs.decimal : 1;
            input.attr("ng-model",$attrs.ngModelName);
            input.attr("formatter","Percentformatter($modelValue,$filter," + decimal + ");");

            var input = $element.find('input.number');
            input.attr("ng-model",$attrs.ngModelName);
        }
    };
});