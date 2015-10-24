app.controller('TutorialCtrl', ['$scope', 'credentialManager', 'tutorialManager', function($scope,credentialManager,tutorialManager) {
    $scope.close = function() {
        tutorialManager.hide();
    };
}]);

