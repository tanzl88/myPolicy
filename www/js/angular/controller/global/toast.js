app.controller('ToastCtrl', function($scope,$mdToast,content) {
    $scope.closeToast = function() {
        $mdToast.hide();
    };
    $scope.content = content;
});

app.controller('WarningToastCtrl', function($scope,$mdToast) {
    $scope.closeToast = function() {
        $mdToast.hide();
    };
});