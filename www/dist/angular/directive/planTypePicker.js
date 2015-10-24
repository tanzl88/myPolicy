angular.module('$planTypePicker', []).directive('planTypePicker', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        template: '<input class="inline-block align-middle align-center bg_color" type="text" ng-click="showPlanTypePicker()" style="cursor:inherit; width: 100%;" readonly/>',
        controller: ['$scope', '$element', '$attrs', '$ionicModal', '$timeout', '$parse', '$state', 'findParentService', 'utilityService', function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, findParentService, utilityService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            $scope.planTypePicker = {};
            
            $scope.planType = plan_type_enum_g;
            // ---------------- MODAL FUNCTION ----------------
            $scope.showPlanTypePicker = function () {
                //HIDE KEYBOARD BEFORE MODAL SHOWN
                var delay_time = utilityService.getKeyboardDelay();
                $timeout(function(){
                    $scope.planTypePicker.show();
                },delay_time);
            };

            $scope.closePlanTypePicker = function () {
                $scope.planTypePicker.hide();
            };

            $scope.$on('$destroy', function (id) {
                $scope.planTypePicker.remove();
            });

            $scope.clickItem = function(index) {
                var planType = $scope.planType[index];
                $parse($attrs.ngModelName).assign(parentScope,index);
                $parse($attrs.ngModelName + "Displayed").assign(parentScope,planType);
                $scope.closePlanTypePicker();
                console.log(parentScope);
            };


            var modal_template = '<div class="modal" style="background-color: white">' +
                                    '<ion-header-bar style="background-color: #fed82f">' +
                                        '<h1 class="title" ng-bind="placeholder"></h1>' +
                                        ' <a ng-click="closePlanTypePicker()" class="button button-icon icon ion-android-close"></a>' +
                                    '</ion-header-bar>' +
                                    '<ion-content>' +
                                        '<ion-list>' +
                                            '<ion-item ng-click="clickItem($index)" ng-repeat="type in planType" style="font-size: 0.9em; padding: 4% 5%;">{{type}}</ion-item>' +
                                        '</ion-list>' +
                                    ' </ion-content>' +
                                 '</div>';
            $scope.planTypePicker = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
        }],
        compile: function ($element, $attrs, $scope) {
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            var input = $element.find('input');
            angular.forEach({
                //'name': $attrs.name,
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