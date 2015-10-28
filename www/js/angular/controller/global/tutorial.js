app.controller('TutorialCtrl', function($scope,credentialManager,tutorialManager) {
    $scope.close = function() {
        tutorialManager.hide();
    };
});

