angular.module('$suggestAmtEditor', []).directive('suggestAmtEditor', function () {
    return {
        scope: true,
        restrict: 'E',
        require: [],
        //require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        template: '<p class="amt inline-block align-middle" ng-click="showSuggestAmtEditor($index)"></p>',
        //template: '<input class="align-center bg_color datepicker" type="text" ng-click="showSuggestAmtEditor()" style="cursor:inherit; width: 100%;" readonly required/>',
        controller: function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, $translate, findParentService) {
            var parentScope = findParentService.findByFunctionName($scope,"initVar");
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

                //    $timeout(function(){

                //    },delay_time);
            };

            $scope.closeSuggestAmtEditor = function () {
                $scope.suggestAmtEditor.hide();
            };

            $scope.$on('$destroy', function (id) {
                console.log("KABOOOOOOM!!!!!!!!!!!!!!!!!");
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
                                                //'<toggle-switch ng-model="$parent.$parent.pickerMode" ng-change="pickerModeChange()" on-label="{{\'BY_YEAR\' | translate}}" off-label="{{\'BY_AGE\' | translate}}"><toggle-switch>' +
                                                //'<div class="col align-center">{{"PICKER_EDIT_SUGGESTED" | translate}}</div>' +
                                                '<div class="restore_default_button inline-block" ng-click="restoreDefault()">{{"RESTORE_DEFAULT" | translate}}</div>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row pickerScroll">' +
                                                '<input class="suggestAmtInput" type="number" pattern="[0-9]*" ng-model="$parent.$parent.currentAmt"/>' +
                                            '</div>' +
                                            '<div class="birthday_divider"></div>' +
                                            '<div class="row picker_buttons">' +
                                                '<div class="col align-center" ng-click="closeSuggestAmtEditor()">{{"PICKER_CANCEL" | translate}}</div>' +
                                                '<div class="col align-center" ng-click="clickDone()">{{"PICKER_DONE" | translate}}</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                 '</div>';
            $scope.suggestAmtEditor = $ionicModal.fromTemplate(modal_template, {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: false
            });
        },
        compile: function ($element, $attrs, $scope) {
            //ASSIGN INPUT ELEMENT ATTRIBUTE
            var paragraph = $element.find('p');
            angular.forEach({
                'ng-bind': $attrs.ngBindData + " | number"
            }, function (value, name) {
                if (angular.isDefined(value)) {
                    paragraph.attr(name, value);
                }
            });
        }
    };
});