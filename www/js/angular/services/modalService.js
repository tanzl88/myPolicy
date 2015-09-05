app.service('modalService', function($q,$ionicModal) {
    //var currency_g;
    var modal = {};

    //$scope.$on('$destroy', function() {
    //    $scope.modal.remove();
    //});
    return {
        init : function(modalName,templateName,parentScope) {
            var dfd = $q.defer();
            $ionicModal.fromTemplateUrl(templateName + '.html', {
                scope: parentScope,
                animation: 'slide-in-up'
            }).then(function(resultModal) {
                modal[modalName] = resultModal;
                dfd.resolve(resultModal);
            });
            return dfd.promise;
        },
        open : function(modalName,modalData,callback) {
            modal[modalName].data = modalData;
            modal[modalName].show();
            if (validity_test(callback)) callback;
        },
        close : function(modalName,callback) {
            modal[modalName].hide();
        },
    }
});