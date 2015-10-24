app.controller('EditAdvisorProfileCtrl', ['$scope', '$q', '$http', '$timeout', '$toast', '$ionicHistory', '$toast', '$translate', '$cordovaFile', 'picNotesService', 'advisorDataDbService', 'loadingService', 'modalService', 'errorHandler', function($scope,$q,$http,$timeout,$toast,$ionicHistory,$toast,$translate,$cordovaFile,
                                                  picNotesService,advisorDataDbService,loadingService,modalService,errorHandler) {
    var logo_container = $("#company_logo_container");
    $(logo_container).height($(logo_container).width());

    $scope.initVar = function() {
        if (advisorDataDbService.profileFound()) {
            $scope.dataObj = angular.copy(advisorDataDbService.getData());
            if ($scope.dataObj.logo) {
                picNotesService.getLogo().then(function(result){
                    $scope.logo = result;
                });
            }
        } else {
            $scope.dataObj = {
                name        : undefined,
                logo        : false,
                title       : undefined,
                agency      : undefined,
                company     : undefined,
                repNo       : undefined,
                address     : undefined,
                phone       : undefined,
                email       : undefined,
                website     : undefined,
                education   : undefined
            };
        }
    };

    $scope.submit = function(form) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('Core', 'Advisor Profile', 'Add / Edit');

        if (form.$invalid) {
            form.name.$setDirty();
            form.company.$setDirty();
        } else {
            loadingService.show("SUBMITTING");
            var input = {
                name        : form.name.$modelValue,
                title       : form.title.$modelValue,
                agency      : form.agency.$modelValue,
                company     : form.company.$modelValue,
                repNo       : form.repNo.$modelValue,
                address     : form.address.$modelValue,
                phone       : form.phone.$modelValue,
                email       : form.email.$modelValue,
                website     : form.website.$modelValue,
                education   : form.education.$modelValue,
            };
            //console.log(input);

            $http.post(ctrl_url + "set_advisor_profile", input)
                .success(function(statusData){
                    if (statusData.status === "OK") {
                        var homeViewScope = $("#home_view").scope();
                        homeViewScope.advisorProfileFound = true;
                        homeViewScope.advisorData = input;
                        advisorDataDbService.set(input);

                        //GO BACK TO PROFILE AND ANIMATE DASHBOARD
                        loadingService.hide();
                        $ionicHistory.goBack();
                        homeViewScope.dashboardAnimate();
                    } else {
                        errorHandler.handleOthers(statusData.status);
                    }

                });
        }
    };

    function upload_pic(imageURI) {
        var lastSlashPosition = imageURI.lastIndexOf("/");
        var path              = imageURI.substr(0,lastSlashPosition + 1);
        var filename          = imageURI.substr(lastSlashPosition + 1);
        var picId             = unique_id();

        var input = {
            userId : $scope.userId,
            picId  : picId,
        };

        $timeout(function(){
            picNotesService.uploadProfile(imageURI,input).then(function(dataStatus){
                console.log(dataStatus);
                if (dataStatus.status === "OK") {
                    $cordovaFile.removeFile(path, filename)
                        .then(function (fileEntry) {
                            $scope.logo = {
                                src : dataStatus.data + "?decache=" + Math.random()
                            };
                            $scope.dataObj.logo = true;
                            advisorDataDbService.setLogo(true);
                            loadingService.hide();
                        }, function (error) {
                            console.log(error);
                            // error
                        });
                } else {
                    $toast.show("UNKNOWN_ERROR");
                    loadingService.hide();
                }
            });
        },50);
    }

    function check_pic_dimension(url,size) {
        var dfd = $q.defer();
        var img = new Image();
        img.onload = function(){
            if (img.height >= size && img.width >= size) {
                dfd.resolve(url);
            } else {
                dfd.resolve(false);
            }
        };
        img.src = url;
        return dfd.promise;
    }

    var allowUploadType = ["jpg","jpeg","png"];
    $scope.gallery = function() {
        window.imagePicker.getPictures(
            function(results) {
                for (var i = 0; i < results.length; i++) {
                    var imageUrl = ((typeof results[i] === "object") && (results[i] !== null)) ? "file://" + results[i]["original"] : results[i];
                    console.log(imageUrl);
                    var split = imageUrl.split(".");
                    var filetype = split[split.length - 1];
                    //IF FILETYPE CORRECT, ELSE FILETYPE ERROR
                    if (allowUploadType.indexOf(filetype) >= 0) {
                            check_pic_dimension(imageUrl,500).then(function(dimensionOK){
                                if (dimensionOK === false) {
                                    $toast.show("PIC_DIMENSION_ERROR");
                                } else {
                                    loadingService.showWithVar("UPLOADING",{
                                        percent : 0
                                    });
                                    upload_pic(dimensionOK);
                                }
                            });
                    } else {
                        $toast.show("PIC_TYPE_ERROR");
                    }

                }
            }, function (error) {
                console.log('Error: ' + error);
            }, {
                maximumImagesCount: 1,
                //width   : 1500,
                //height  : 1500,
                quality : 50,
                title   : "From gallery",
                message : "Select an image to upload"
            }
        );
    };

    // --------------- REMOVAL ---------------
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("LOGO_REMOVE_MSG");
    $scope.remove = function(event) {
        event.stopPropagation();
        $scope.removeModal.show();
    };
    $scope.confirmRemove = function() {
        loadingService.show("REMOVING_LOGO");
        $timeout(function(){
            picNotesService.removeProfile(function(){
                $scope.dataObj.logo = false;
                advisorDataDbService.setLogo(false);
                $scope.logo.src = undefined;
                $scope.removeModal.hide();
                loadingService.hide();
            });
        },50);
    };
}]);

