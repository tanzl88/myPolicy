var app = angular.module('myPolicy',['ionic','ionic.service.core','ionic.service.push',
    'ngCordova','ngMessages','ngAnimate','pascalprecht.translate','Mac',
    'validation.match','ngmodel.format','ngMaterial','ngDropdowns',
    '$datePicker','$dateTimePicker','$countdownTimePicker','$termPicker','$currencyPicker','$currencyInput','$planTypePicker','$suggestAmtEditor','popupPicker',
    'ui.bootstrap-slider','ui.checkbox','toggle-switch']);

//CHANGE ANDROID DEFAULT UI
app.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.tabs.style("");
    $ionicConfigProvider.tabs.position("");
});
//LOCALIZATION
app.factory('customLoader', function ($http, $q, $timeout) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer();
        // do something with $http, $q and key to load localization files

        var data = {
            'CURRENCY': 'RM '
        };

        // resolve with translation data
        $timeout(function () {
            deferred.resolve(data);
        }, 1000);

        return deferred.promise;
    };
});
app.factory('currencyLoader', function ($http,$q,$timeout) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer();
        var data = {
            'CURRENCY': currency_g,
        };
        deferred.resolve(data);

        return deferred.promise;
    };
});
app.factory('timeoutHttpIntercept', function ($rootScope, $q) {
    return {
        'request': function(config) {
            config.timeout = 10000;
            return config;
        },
        //'requestError': function(rejection) {
        //    // do something on error
        //    console.log("REJECTION");
        //    console.log(rejection);
        //    if (canRecover(rejection)) {
        //        return responseOrNewPromise
        //    }
        //    return $q.reject(rejection);
        //},
    };
});


app.config(['$translateProvider', function ($translateProvider) {
    // add translation table
    $translateProvider.addInterpolation('$translateMessageFormatInterpolation')
                      .translations('en', translations_en);
                    //.translations('zh', translations_zh)
    $translateProvider.registerAvailableLanguageKeys(['en', 'zh'], {
            'en*': 'en',
            //'zh*': 'zh',
            '*': 'en'
    });
    $translateProvider.fallbackLanguage('en');
    $translateProvider.useLoader('currencyLoader');
    $translateProvider.preferredLanguage('en');
    $translateProvider.forceAsyncReload(true);
    $translateProvider.useSanitizeValueStrategy('escaped');
    //var lang = window.localStorage["language"];
    //if (lang === undefined) {
    //  $translateProvider.determinePreferredLanguage();
    //} else {
    //  $translateProvider.preferredLanguage(lang);
    //  moment.locale(lang);
    //}

}]);


//AJAX
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('timeoutHttpIntercept');
    $httpProvider.defaults.transformRequest = function (data) {
        if (data === undefined) {
            return data;
        }
        return $.param(data);
    };
    $httpProvider.defaults.headers.post['Content-Type'] = ''
        + 'application/x-www-form-urlencoded; charset=UTF-8';
});
//BACK BUTTON
app.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.backButton.previousTitleText(false).text('');
    $ionicConfigProvider.views.forwardCache(true);
    //$ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.navBar.positionPrimaryButtons("left");
});


app.run(function ($rootScope,$ionicPlatform,$state,$cordovaNetwork,currencyService,
                  localNotificationService,pushNotificationService) {
    $ionicPlatform.ready(function () {
        //KEYBOARD
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
            //HIDE FOOTER BAR WHEN KEYBOARD APPEAR
            window.addEventListener('native.keyboardshow', function () {
                document.body.classList.add('keyboard-open');
            });
        }

        //LOCK SCREEN IMMEDIATELY ONCE READY
        screen.lockOrientation("portrait-primary");

        //CURRENCY
        var currencyIndex = localStorage.getItem("currency");
        if (validity_test(currencyIndex)) currencyService.setCurrency(currencyIndex);

        //iOS STATUS BAR & STYLING
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        ionic.Platform.fullScreen(false,true);

        // MODIFY FILE PATH
        if (ionic.Platform.isAndroid()) {
            myFsRootDirectory1 = 'file:///storage/emulated/0/'; // path for tablet
            myFsRootDirectory2 = 'file:///storage/sdcard0/'; // path for phone
            fileTransferDir = cordova.file.externalDataDirectory;
            fileCacheDir    = cordova.file.externalCacheDirectory;
            if (fileTransferDir.indexOf(myFsRootDirectory1) === 0) fileDir = fileTransferDir.replace(myFsRootDirectory1, '');
            if (fileTransferDir.indexOf(myFsRootDirectory2) === 0) fileDir = fileTransferDir.replace(myFsRootDirectory2, '');
        }
        if (ionic.Platform.isIOS()) {
            fileTransferDir = cordova.file.documentsDirectory;
            fileCacheDir    = cordova.file.cacheDirectory;
            fileDir = '';
        }

        //NETWORK STATUS
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            var onlineState = networkState;
            $rootScope.isOffline = false;
        });
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            var offlineState = networkState;
            $rootScope.isOffline = true;
        });
        $rootScope.isOffline = $cordovaNetwork.isOffline();
    });
});
