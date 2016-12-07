angular.module('popupPicker', []).directive('popupPicker', function () {
    return {
        scope: true,
        restrict: 'E',
        require: ['ngModelName','ngData','ngSelectedId','ngSelectedValue'],
        template: '<input class="inline-block align-middle align-center bg_color" type="text" ng-click="showPopupPicker()" style="cursor:inherit; width: 100%;" readonly/>',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, findParentService, utilityService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            $scope.popupPicker = {};
            $scope.popupData = $parse($attrs.ngData)($scope);
            console.log($scope.popupData);

            // ---------------- MODAL FUNCTION ----------------
            $scope.showPopupPicker = function () {
                //HIDE KEYBOARD BEFORE MODAL SHOWN
                var delay_time = utilityService.getKeyboardDelay();
                $timeout(function(){
                    $scope.popupPicker.show();
                },delay_time);
            };

            $scope.closePopupPicker = function () {
                $scope.popupPicker.hide();
            };

            $scope.$on('$destroy', function (id) {
                $scope.popupPicker.remove();
            });

            $scope.clickItem = function(index) {
                $parse($attrs.ngSelectedId).assign(parentScope,index);
                $parse($attrs.ngSelectedValue).assign(parentScope,$scope.popupData[index]);
                $scope.closePopupPicker();
            };


            var modal_template = '<div class="modal" style="background-color: white">' +
                                    '<ion-header-bar style="background-color: #fed82f">' +
                                        '<h1 class="title" ng-bind="placeholder"></h1>' +
                                        ' <a ng-click="closePopupPicker()" class="button button-icon icon ion-android-close"></a>' +
                                    '</ion-header-bar>' +
                                    '<ion-content>' +
                                        '<ion-list>' +
                                            '<ion-item ng-click="clickItem($index)" ng-repeat="item in popupData" style="font-size: 0.9em; padding: 4% 5%;">{{item}}</ion-item>' +
                                        '</ion-list>' +
                                    ' </ion-content>' +
                                 '</div>';
            $scope.popupPicker = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
        },
        compile: function ($element, $attrs, $scope) {
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            var input = $element.find('input');
            angular.forEach({
                'ng-model': $attrs.ngModelName
            }, function (value, name) {
                if (angular.isDefined(value)) {
                    input.attr(name, value);
                }
            });
        }
    };
});