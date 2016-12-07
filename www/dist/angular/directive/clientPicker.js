angular.module('$clientPicker', []).directive('clientPicker', function () {
    return {
        scope: true,
        restrict: 'A',
        require: ['ngModelValue','ngModelId','ngModelData'],
        controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', '$ionicModal', 'findParentService', function ($scope, $element, $attrs, $timeout, $parse, $ionicModal, findParentService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            $scope.clientPicker = {};

            $scope.data = $parse($attrs.ngModelData)(parentScope);
            $scope.showSearchBar = $attrs.showSearchBar === undefined ? false : true;

            // ---------------- MODAL FUNCTION ----------------
            $scope.showClientPicker = function (event) {

                //HIDE KEYBOARD BEFORE MODAL SHOWN
                //var delay_time = utilityService.getKeyboardDelay();
                //$timeout(function(){
                    $scope.clientPicker.show();
                    $scope.search = {};
                //},delay_time);
            };

            $scope.closeClientPicker = function () {
                $timeout(function(){
                    $scope.clientPicker.hide();
                },10);

            };

            $scope.$on('$destroy', function (id) {
                $scope.clientPicker.remove();
            });

            $scope.clickItem = function(event,item) {

                event.stopImmediatePropagation();

                $parse($attrs.ngModelValue).assign(parentScope,item.name);
                $parse($attrs.ngModelId).assign(parentScope,item.id);
                $scope.closeClientPicker();
            };


            var modal_template = '<div class="modal" style="background-color: white">' +
                                    '<ion-header-bar style="background-color: #343741;">' +
                                        '<button class="search_bar_container button no-border" style="width: 100%;">' +
                                            '<input ng-if="showSearchBar" class="" type="search" ng-model="search.name" style="margin-left: 2%; padding: 0% 4%; width: 80%; background: white; border-radius: 5px;">' +
                                        '</button>' +
                                        '<button class="relative button buttons-right no-border" style="position: absolute; right: 6px; color: white;" ng-click="closeClientPicker()">' +
                                            '<i class="ion-android-close"></i>' +
                                        '</button>' +
                                        //'<a ng-click="closeClientPicker()" class="button button-icon icon ion-android-close transform-align-middle" style="color: white; position: absolute; right: 0;"></a>' +
                                    '</ion-header-bar>' +
                                    '<ion-content has-bouncing="true">' +
                                        //'<div style="height: 10%;"></div>' +
                                        //'<ion-scroll style="height: 90%;">' +
                                            '<div>' +
                                                '<div ng-click="clickItem($event,item)" class="client_item button_flash border-bottom" ng-repeat="item in data | filter:search" style="padding: 4% 5%;">{{::item.name}}</div>' +
                                            '</div>' +
                                        //'</ion-scroll>' +
                                    ' </ion-content>' +
                                 '</div>';
            $scope.clientPicker = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
        }]
    };
});
