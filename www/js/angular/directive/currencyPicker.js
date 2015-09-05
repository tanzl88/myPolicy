angular.module('$currencyPicker', []).directive('currencyPicker', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        template: '<input class="align-center bg_color datepicker" type="text" ng-click="showCurrencyPicker()" style="cursor:inherit;" readonly required/>',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, findParentService, currencyService, $cordovaKeyboard) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            $scope.currencyPicker = {};
            
            $scope.data = currency_list_g;
            // ---------------- MODAL FUNCTION ----------------
            $scope.showCurrencyPicker = function () {
                var delay_time = 0;
                if (isMobile() && $cordovaKeyboard.isVisible()) {
                    $cordovaKeyboard.close();
                    delay_time = 400;
                }
                $timeout(function(){
                    $scope.currencyPicker.show();
                },delay_time);
            };

            $scope.closeCurrencyPicker = function () {
                $scope.currencyPicker.hide();
            };

            $scope.$on('$destroy', function (id) {
                $scope.currencyPicker.remove();
            });

            $scope.clickItem = function(currencyIndex) {
                currencyService.setCurrency(currencyIndex);
                $parse($attrs.ngModelName).assign(parentScope,currency_label_g);
                $scope.closeCurrencyPicker();
            };


            var modal_template = '<div class="modal" style="background-color: white">' +
                                    '<ion-header-bar style="background-color: #fed82f">' +
                                        '<h1 class="title" ng-bind="placeholder"></h1>' +
                                        ' <a ng-click="closeCurrencyPicker()" class="button button-icon icon ion-android-close"></a>' +
                                    '</ion-header-bar>' +
                                    '<ion-content>' +
                                        '<ion-list>' +
                                            '<ion-item ng-click="clickItem($index)" ng-repeat="currency in data" style="font-size: 0.9em; padding: 4% 5%;">{{currency.fullName}}</ion-item>' +
                                        '</ion-list>' +
                                    ' </ion-content>' +
                                 '</div>';
            $scope.currencyPicker = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
        },
        compile: function ($element, $attrs, $scope) {
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            var input = $element.find('input');
            angular.forEach({
                //'name': $attrs.name,
                //'placeholder': $attrs.ngPlaceholder,
                'ng-model': $attrs.ngModelName
            }, function (value, name) {
                if (angular.isDefined(value)) {
                    input.attr(name, value);
                }
            });
        }
    };
});