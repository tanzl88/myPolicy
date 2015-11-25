angular.module('$suggestAmtEditor', []).directive('suggestAmtEditor', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        template: '<p class="amt inline-block align-middle" ng-click="showSuggestAmtEditor($index)" style="width: 95%;">{{cat.suggested | number}}</p>' +
                  '<p class="amt inline-block" ng-if="cat.defaultSuggested && showAsterisk === true" style="width: 4%; vertical-align: super; font-size: 0.7em;">*</p>',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, $translate, findParentService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
            $scope.showAsterisk = $attrs.showAsterisk === undefined ? true : false;
            $scope.suggestAmtEditor = {};

            $scope.showSuggestAmtEditor = function (index) {
                //ASSIGN INDEX
                $scope.index = index;
                $scope.currentAmt = parseInt(parentScope.viewObj.cat[index].suggested);
                $scope.suggestAmtEditor.show();

                //FOCUS INPUT
                $timeout(function(){
                    var input = $(".modal .suggestAmtEditor.suggestAmtEditor" + index +  " input");
                    $(input).focus();
                },100);
            };

            $scope.closeSuggestAmtEditor = function () {
                $scope.suggestAmtEditor.hide();
            };

            $scope.$on('$destroy', function (id) {
                console.log("SUGGESTED AMT EDITOR DESTROYED");
                $scope.suggestAmtEditor.remove();
            });

            $scope.clickDone = function() {
                var input = $(".modal .suggestAmtEditor.suggestAmtEditor" + $scope.index +  " input");
                var newValue = parseInt($(input).val());
                var catObj = parentScope.viewObj.cat[$scope.index];
                //IF THE VALUE IS DEFAULT AND VALUE HAS BEEN CHANGED
                if (catObj.suggested !== newValue) {
                    if (catObj.defaultSuggested) catObj.defaultSuggested = false;
                    catObj.suggested = newValue;
                    parentScope.reCalculate($scope.index,newValue);
                }
                $scope.closeSuggestAmtEditor();
            };
            $scope.restoreDefault = function() {
                parentScope.restoreDefault($scope.index);
            };

            var modal_template = '<div class="modal" style="background-color: rgba(0,0,0,0.6)">' +
                                    '<div>' +
                                        '<div class="suggestAmtEditor suggestAmtEditor{{$index}} transform-align-middle">' +
                                            '<div class="picker_header align-right">' +
                                                '<div class="restore_default_button inline-block" ng-click="restoreDefault()">{{"RESTORE_DEFAULT" | translate}}</div>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row pickerScroll">' +
                                                '<input class="suggestAmtInput" type="number" pattern="[0-9]*" ng-model="$parent.$parent.currentAmt"/>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row picker_buttons">' +
                                                '<md-button class="col align-center bg_gray_color" ng-click="closeSuggestAmtEditor()">{{"PICKER_CANCEL" | translate}}</md-button>' +
                                                '<md-button class="col align-center bg_theme_color" ng-click="clickDone()">{{"PICKER_DONE" | translate}}</md-button>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                 '</div>';
            $scope.suggestAmtEditor = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
        }
    };
});