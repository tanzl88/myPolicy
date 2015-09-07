app.service('pushNotificationService', function ($http,$cordovaDevice) {
    return {
        init : function() {
            if (ionic.Platform.isWebView()) {
                console.log("INIT PUSH");
                console.log(parsePlugin);
                var appId = "ypj1dTwLw4pQKOJfR4sUVnXseHTd9YiJEwCInIiI";
                var key = "BsbeM6bIj4g856Z6ZBZkGk7MGzhjV3tT4G7FxmIn";
                parsePlugin.initialize(appId,key,function(success){
                    console.log("PUSH INIT SUCCESS");
                    //console.log(success);
                    parsePlugin.getInstallationId(function(id) {
                        console.info("PARSE ID", id);
                        if (ionic.Platform.isWebView()) {
                            var input = {
                                parseId : id,
                            };
                            $http.post(register_url + "set_user_parse",input);
                        }
                    }, function(error) {
                        console.log(error);
                    });
                }, function(error){
                    console.log(error);
                });
            }


            //var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
            //if (ionic.Platform.isAndroid()) {
            //    //REGISTER
            //    //set push notifications handler
            //    document.addEventListener('push-notification', function(event) {
            //        var title = event.notification.title;
            //        var userData = event.notification.userdata;
            //
            //        if(typeof(userData) != "undefined") {
            //            console.warn('user data: ' + JSON.stringify(userData));
            //        }
            //
            //        alert(title);
            //    });
            //
            //    //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_NUMBER", pw_appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
            //    pushNotification.onDeviceReady({ projectid: "798861488666", pw_appid : "B5ECF-A591E" });
            //
            //    //register for pushes
            //    pushNotification.registerDevice(
            //        function(status) {
            //            var pushToken = status;
            //            console.warn('push token: ' + pushToken);
            //        },
            //        function(status) {
            //            console.warn(JSON.stringify(['failed to register ', status]));
            //        }
            //    );
            //
            //    //RECEIVER
            //    document.addEventListener('push-notification', function(event) {
            //        var title = event.notification.title;
            //        var userData = event.notification.userdata;
            //
            //        console.warn('user data: ' + JSON.stringify(userData));
            //        alert(title);
            //    });
            //} else if (ionic.Platform.isIOS()) {
            //    //set push notification callback before we initialize the plugin
            //    document.addEventListener('push-notification', function(event) {
            //        //get the notification payload
            //        var notification = event.notification;
            //
            //        //display alert to the user for example
            //        alert(notification.aps.alert);
            //
            //        //clear the app badge
            //        pushNotification.setApplicationIconBadgeNumber(0);
            //    });
            //
            //    //initialize the plugin
            //    pushNotification.onDeviceReady({pw_appid:"B5ECF-A591E"});
            //
            //    //register for pushes
            //    pushNotification.registerDevice(
            //        function(status) {
            //            var deviceToken = status['deviceToken'];
            //            console.warn('registerDevice: ' + deviceToken);
            //        },
            //        function(status) {
            //            console.warn('failed to register : ' + JSON.stringify(status));
            //            alert(JSON.stringify(['failed to register ', status]));
            //        }
            //    );
            //
            //    //reset badges on app start
            //    pushNotification.setApplicationIconBadgeNumber(0);
            //
            //    //RECEIVER
            //    document.addEventListener('push-notification', function(event) {
            //        var notification = event.notification;
            //        alert(notification.aps.alert);
            //        pushNotification.setApplicationIconBadgeNumber(0);
            //    });
            //}



            //IONIC PUSH
            //if (ionic.Platform.isWebView()) {
                //$ionicPush.register({
                //    canShowAlert: true, //Can pushes show an alert on your screen?
                //    canSetBadge: true, //Can pushes update app icon badges?
                //    canPlaySound: true, //Can notifications play a sound?
                //    canRunActionsOnWake: true, //Can run actions outside the app,
                //    onNotification: function(notification) {
                //        // Handle new push notifications here
                //        console.log(notification);
                //        return true;
                //    }
                //});
            //}

            //$rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
            //    console.log('Got token', data.token, data.platform);
            //    // Do something with the token
            //});

        },
        push : function(userIdArray) {
            var privateKey = '499afdccf75ee8841660b0b6fff2d8823738a1a8b0223406';
            var auth = btoa(privateKey + ':');
            var appId = '466843af';

            var pushObj = {
                //production      : false,
                user_ids        : userIdArray,
                notification    : {
                                    alert   : "Hello World!"
                                  },
            };
            var req = {
                method: 'POST',
                url: "https://push.ionic.io/api/v1/push",
                transformRequest : function(data) {
                    return JSON.stringify(data);
                },
                headers: {
                    'Content-Type': 'application/json',
                    'X-Ionic-Application-Id': appId,
                    'Authorization': 'basic ' + auth
                },
                data: pushObj
            };
            $http(req);
        }
    }
});