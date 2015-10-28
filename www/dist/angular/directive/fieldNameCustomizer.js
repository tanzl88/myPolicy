angular.module('$fieldNameCustomizer', []).directive('fieldNameCustomizer', function () {
    return {
        //scope: {
        //    data : "=data"
        //},
        //scope: true,
        scope : {
            name : "@name"
        },
        restrict: 'E',
        require: [],
        template: '<p>{{defaultFieldName | translate}}</p>' +
                  '<input class="field_name_input bg_color" type="text">',
        compile: function ($element,$attrs) {
            console.log("COMPILE: " + $attrs.name);
            return {
                pre : function($scope,$element,$attrs) {
                    //ASSIGN INPUT ELEMENT ATTRIBUTE
                    console.log("PRELINK: " + $attrs.name);
                    var input = $element.find('input');
                    input.attr("name",$attrs.name);
                    input.attr("ng-model","editNamesArray." + $attrs.name);
                }
            };
        },
        controller: ['$scope', '$element', '$attrs', '$ionicModal', '$timeout', '$parse', '$state', 'findParentService', 'currencyService', 'utilityService', function ($scope, $element, $attrs, $ionicModal, $timeout, $parse, $state, findParentService, currencyService, utilityService) {
            console.log($scope.editNamesArray);
            console.log($attrs.name);
            console.log($scope.editNamesArray[$attrs.name]);
            //$scope.fieldName = $scope.data.title;
            //$scope.defaultFieldName = $scope.fieldName + "_DEFAULT";
        }]

    };
});