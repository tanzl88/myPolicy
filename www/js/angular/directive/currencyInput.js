angular.module('$currencyInput', []).directive('currencyInput', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        template:   '<input class="align-middle align-center bg_color number" type="number" pattern="[0-9]+([\.|,][0-9]+)?" step="0.01" ng-class="{\'front\' : state === \'input\'}" ng-keydown="goToNext($event)" ng-blur="inputNumberBlur($event)">' +
                    '<input class="align-middle align-center bg_color text" type="text"  ng-class="{\'front\' : state !== \'input\'}"' +
                    'model-format="currency" formatter="formatter($modelValue,$filter);" readonly ng-click="triggerNumpad()">',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $interval, $parse, $state, findParentService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            var numberInput = $element.find('input.number');
            var decimal = validity_test($attrs.decimal) ? $attrs.decimal : 0;
            //$scope.state = "show";

            $scope.triggerNumpad = function() {
                $scope.state = "input";

                var focusTimer = $interval(function(){
                    if ($(numberInput).css("display") !== "none") {
                        $(numberInput).val($parse($attrs.ngModelName)(parentScope));
                        numberInput.focus();
                        $interval.cancel(focusTimer);
                    }

                    if ($attrs.inputFooter !== undefined) $("#" + $attrs.inputFooter).show();
                },333);
            };


            $scope.inputNumberBlur = function(event) {
                $scope.state = "show";
                var roundedValue = $(numberInput).val() === "" ? undefined : parseFloat($(numberInput).val()).toFixed(decimal);
                $(numberInput).val("");
                $parse($attrs.ngModelName).assign(parentScope, roundedValue);

                if ($attrs.inputFooter !== undefined) $("#" + $attrs.inputFooter).hide();
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

        },
        compile: function ($element, $attrs) {
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            var input = $element.find('input.text');
            var decimal = validity_test($attrs.decimal) ? $attrs.decimal : 0;
            input.attr("ng-model",$attrs.ngModelName);
            input.attr("formatter","formatter($modelValue,$filter," + decimal + ");");
        }
    };
});