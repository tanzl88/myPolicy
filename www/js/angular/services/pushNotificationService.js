app.service('pushNotificationService', function ($rootScope,$http,$cordovaDevice,$cordovaPush) {
    return {
        init : function() {
            if (ionic.Platform.isWebView()) {
                console.log("INIT PUSH");
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


                if (ionic.Platform.isIOS()) {
                    var config = {
                        "badge": true,
                        "sound": true,
                        "alert": true,
                    };
                } else {
                    var config = {
                        "senderID": "798861488666",
                    };
                }

                registerPush(config);
                $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                    if (ionic.Platform.isIOS()) {
                        handleIOS(notification);
                    } else {
                        handleAndroid(notification);
                    }
                });
            }

            function registerPush(config) {
                $cordovaPush.register(config).then(function(result) {
                    console.log(result);
                }, function(err) {
                    alert("Registration error: " + err)
                });
            }
            function handleIOS(notification) {
                //if (notification.alert) {
                //    navigator.notification.alert(notification.alert);
                //}

                if (notification.sound) {
                    var snd = new Media(event.sound);
                    snd.play();
                }

                if (notification.badge) {
                    $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
                        // Success!
                    }, function(err) {
                        // An error occurred. Show a message to the user
                    });
                }
            }
            function handleAndroid(notification) {
                switch(notification.event) {
                    case 'registered':
                        //if (notification.regid.length > 0 ) {
                        //    alert('registration ID = ' + notification.regid);
                        //}
                        break;

                    case 'message':
                        // this is the actual push notification. its format depends on the data model from the push server
                        alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                        break;

                    case 'error':
                        alert('GCM error = ' + notification.msg);
                        break;

                    default:
                        alert('An unknown GCM event has occurred');
                        break;
                }
            }
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