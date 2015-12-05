var app = angular.module('myPolicy',['templates','ionic','ionic.service.core','ngIOS9UIWebViewPatch',
    'ngCordova','ngMessages','ngAnimate','pascalprecht.translate','Mac',
    'validation.match','ngmodel.format','ngMaterial','ngDropdowns','reactTable',
    '$datePicker','$dateTimePicker','$countdownTimePicker','$termPicker','$currencyPicker','$currencyInput','$percentInput','$planTypePicker','$suggestAmtEditor','popupPicker','reportTypePicker',
    'ui.bootstrap-slider','ui.checkbox','toggle-switch']);

//CHANGE ANDROID DEFAULT UI
app.config(['$ionicConfigProvider', function ($ionicConfigProvider) {
    $ionicConfigProvider.tabs.style("");
    $ionicConfigProvider.tabs.position("");
}]);
//LOCALIZATION
app.factory('fieldNameLoader', ['$http', '$q', '$timeout', 'fieldNameService', function ($http,$q,$timeout,fieldNameService) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer();
        var data = {};
        _.extend(data,fieldNameService.getFieldName("full_table"));
        _.extend(data,{'CURRENCY': currency_g});

        deferred.resolve(data);

        return deferred.promise;
    };
}]);
app.factory('timeoutHttpIntercept', ['$rootScope', '$q', function ($rootScope, $q) {
    return {
        'request': function(config) {
            config.timeout = 15000;
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
}]);


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
    $translateProvider.useLoader('fieldNameLoader');
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
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('timeoutHttpIntercept');
    $httpProvider.defaults.transformRequest = function (data) {
        if (data === undefined) {
            return data;
        }
        return $.param(data);
    };
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
}]);
//BACK BUTTON
app.config(['$ionicConfigProvider', function ($ionicConfigProvider) {
    $ionicConfigProvider.backButton.previousTitleText(false).text('');
    $ionicConfigProvider.views.forwardCache(true);
    //$ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.navBar.positionPrimaryButtons("left");
}]);


app.run(['$rootScope', '$ionicPlatform', '$state', '$cordovaNetwork', 'currencyService', function ($rootScope,$ionicPlatform,$state,$cordovaNetwork,currencyService) {
    $ionicPlatform.ready(function () {
        //KEYBOARD
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
            //HIDE FOOTER BAR WHEN KEYBOARD APPEAR
            window.addEventListener('native.keyboardshow', function () {
                document.body.classList.add('keyboard-open-native');
            });
            window.addEventListener('native.keyboardhide', function () {
                document.body.classList.remove('keyboard-open-native');
            });
        }

        //LOCK SCREEN IMMEDIATELY ONCE READY
        screen.lockOrientation("portrait-primary");

        //CURRENCY
        var currencyIndex = localStorage.getItem("currency");
        if (validity_test(currencyIndex)) currencyService.setCurrency(currencyIndex);

        //iOS STATUS BAR & STYLING
        if (window.StatusBar) {
            //StatusBar.styleDefault();
            //StatusBar.backgroundColorByHexString("#FED82F");
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


        if (ionic.Platform.isWebView()) window.analytics.startTrackerWithId('UA-68783318-1');
    });
}]);