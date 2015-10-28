app.controller('ToastCtrl', ['$scope', '$mdToast', 'content', function($scope,$mdToast,content) {
    $scope.closeToast = function() {
        $mdToast.hide();
    };
    $scope.content = content;
}]);

app.controller('WarningToastCtrl', ['$scope', '$mdToast', function($scope,$mdToast) {
    $scope.closeToast = function() {
        $mdToast.hide();
    };
}]);