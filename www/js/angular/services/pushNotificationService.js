app.service('pushNotificationService', function ($rootScope,$http,$cordovaDevice,$cordovaPushV5,notificationDbService,$toast,$state) {


    return {
        init : function() {
            if (ionic.Platform.isWebView()) {
                //INIT PARSE
                var appId = "ypj1dTwLw4pQKOJfR4sUVnXseHTd9YiJEwCInIiI";
                var key = "BsbeM6bIj4g856Z6ZBZkGk7MGzhjV3tT4G7FxmIn";
                parsePlugin.initialize(appId, key, function (success) {
                    console.log("PUSH INIT SUCCESS");
                    parsePlugin.getInstallationId(function (id) {
                        console.log("PARSE ID", id);
                        if (ionic.Platform.isWebView()) {
                            var input = {
                                parseId: id,
                            };
                            $http.post(register_url + "set_user_parse", input);
                        }
                    }, function (error) {
                        console.log(error);
                    });
                }, function (error) {
                    console.log(error);
                });

                //INIT PUSH PLUGIN
                var config = {
                    android: {
                        senderID: "798861488666"
                    },
                    ios: {
                        alert: true,
                        badge: true,
                        sound: false
                    },
                    windows: {}
                };
                $cordovaPushV5.initialize(config).then(function(result) {
                    $cordovaPushV5.onNotification();

                    $rootScope.$on('$cordovaPushV5:notificationReceived', function (event,notification) {
                        console.log(event);
                        console.log(notification);
                        if (notification.additionalData.foreground) {
                            $toast.showSimple(notification.message);
                        } else {
                            $state.go("tabs.home.notification");
                        }

                        if (notification.message) {
                            notificationDbService.refresh();
                        }
                    });
                }, function(err) {
                    //alert("Registration error: " + err)
                });
            }
        }
    }
});