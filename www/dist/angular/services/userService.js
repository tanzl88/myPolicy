app.service('userService', ['$ionicUser', '$http', 'credentialManager', '$cordovaDevice', function($ionicUser,$http,credentialManager,$cordovaDevice) {
    return {
        init : function() {
            //IONIC USER
            var user = $ionicUser.get();
            if(!user.user_id) {
                user.user_id    = $ionicUser.generateGUID();
                user.credential = credentialManager.getCredential();
            };
            $ionicUser.identify(user).then(function(){
                if (ionic.Platform.isWebView()) {
                    var device = $cordovaDevice.getDevice();
                    var input = {
                        ionicId         : user.user_id,
                        manufacturer    : device.manufacturer,
                        model           : device.model,
                        platform        : device.platform,
                        uuid            : device.uuid,
                        version         : device.version
                    };
                    $http.post(register_url + "set_user_analytics",input);
                }
            });
        }
    }
}]);