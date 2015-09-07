app.service('userService', function($ionicUser,$http,credentialManager) {
    return {
        init : function() {
            //IONIC USER
            var user = $ionicUser.get();
            if(!user.user_id) {
                user.user_id    = $ionicUser.generateGUID();
                user.credential = credentialManager.getCredential();
            };
            $ionicUser.identify(user).then(function(){
                console.log("IDENTIFIED");
                //if (ionic.Platform.isWebView()) {
                //    console.log("ISWEBVIEW");
                //    var device = $cordovaDevice.getDevice();
                //    var input = {
                //        ionicId         : user.user_id,
                //        manufacturer    : device.manufacturer,
                //        model           : device.model,
                //        platform        : device.platform,
                //        uuid            : device.uuid,
                //        version         : device.version
                //    };
                //    $http.post(register_url + "set_user_analytics",input);
                //}
            });
        }
    }
});