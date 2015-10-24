app.controller('GalleryCtrl', function($scope,$rootScope,$q,$http,$toast,$translate,$timeout,$interval,$ionicScrollDelegate,$ionicHistory,
                                       $cordovaCamera,$cordovaFile,$cordovaFileTransfer,
                                       picNotesService,loadingService,modalService) {
    // --------------- INIT VAR ---------------
    $scope.initVar = function() {
        console.log($rootScope.policyId);
        if ($rootScope.policyId === undefined) {
            $ionicHistory.goBack();
        } else {
            $scope.policyId = $rootScope.policyId;
            $scope.userId   = $rootScope.userId;
            delete $rootScope.policyId;
            delete $rootScope.userId;

            loadingService.show("LOADING_IMAGES");
            $scope.refreshPicNotes();
        }

    };
    var lightboxOnLoadListener = false;

    $scope.refreshPicNotes = function() {
        picNotesService.getPicNotes($scope.policyId).then(function(picId){
            $scope.picNotes = picId;
            $scope.removeModal.hide();
            loadingService.hide();
        });
    };

    // --------------- INTERACTION MENU ---------------
    var originatorEv;
    $scope.toggleMenu = function() {
        $timeout(function(){
            $("#galleryMenuTrigger").click();
        },1);
    };
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    // --------------- STYLING ---------------

    $scope.cellStyle = function() {
        var division = 2;
        var container_width = Math.min(window_width_g,window_height_g) - 2;
        var cell_width = (container_width / division) - 2;

        return {
            height : cell_width + "px"
        }
    };

    function upload_pic(imageURI) {
        var lastSlashPosition = imageURI.lastIndexOf("/");
        var path              = imageURI.substr(0,lastSlashPosition + 1);
        var filename          = imageURI.substr(lastSlashPosition + 1);
        var picId             = unique_id();

        var input = {
            policyId : $scope.policyId,
            picId    : picId,
        };

        $timeout(function(){
            picNotesService.upload(imageURI,input).then(function(dataStatus){
                console.log(dataStatus);
                if (dataStatus.status === "OK") {
                    $cordovaFile.removeFile(path, filename)
                        .then(function (fileEntry) {
                            $scope.picNotes.push({
                                id  : picId,
                                policyId : $scope.policyId,
                                src : dataStatus.data
                            });
                            loadingService.hide();
                        }, function (error) {
                            console.log(error);
                            // error
                        });
                } else {
                    //console.log("UPLOAD ERROR");
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

    // --------------- CAMERA ---------------
    $scope.camera = function() {
        var options = {
            destinationType     : Camera.DestinationType.FILE_URI,
            sourceType          : Camera.PictureSourceType.CAMERA,
            targetHeight        : 1500,
            cameraDirection     : 0,
            correctOrientation  : true
        };

        $cordovaCamera.getPicture(options).then(function(imageURI) {
            loadingService.showWithVar("UPLOADING",{
                percent : 0
            });
            upload_pic(imageURI)
        }, function(err) {
            console.log(err);
            // error
        });
    };

    // --------------- GALLERY ---------------
    var allowUploadType = ["jpg","jpeg","png"];
    $scope.gallery = function() {
        window.imagePicker.getPictures(
            function(results) {
                console.log(results);
                console.log(results.length);
                for (var i = 0; i < results.length; i++) {
                    var imageUrl = ((typeof results[i] === "object") && (results[i] !== null)) ? "file://" + results[i]["original"] : results[i];
                    var split = imageUrl.split(".");
                    var filetype = split[split.length - 1];
                    //IF FILETYPE CORRECT, ELSE FILETYPE ERROR
                    if (allowUploadType.indexOf(filetype) >= 0) {
                        check_pic_dimension(imageUrl,500).then(function(dimensionOK){
                            if (dimensionOK === false) {
                                $toast.show("PIC_DIMENSION_ERROR");
                            } else {
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
                width   : 1500,
                height  : 1500,
                quality : 50,
                title   : "From gallery",
                message : "Select an image to upload"
            }
        );
    };

    // --------------- LIGHTBOX ---------------
    modalService.init("lightbox","lightbox",$scope).then(function(modal){
        $scope.lightbox = modal;
    });
    function zoomToMin(assignMin) {
        var scrollDelegate = $ionicScrollDelegate.$getByHandle('lightboxScroll');
        if (assignMin) scrollDelegate.getScrollView().options.minZoom = $scope.minZoom;
        scrollDelegate.zoomTo($scope.minZoom,false);
        $timeout(function(){
            loadingService.hide();
        },200);
    }
    $scope.expand = function(index) {
        loadingService.show("LOADING_FULL_IMAGE");
        var selectedObj = $scope.picNotes[index];
        picNotesService.getFullPic(selectedObj.policyId,selectedObj.id).then(function(imageObj){
            $scope.lightbox.show();

            if (lightboxOnLoadListener === false) {
                var lightbox_timer = $interval(function(){
                    if ($("#lightbox_image").length > 0) {
                        $("#lightbox_image").on("load",function(){
                            lightboxOnLoadListener = true;
                            var width           = this.clientWidth;
                            var height          = this.clientHeight;
                            var widthMinZoom    = Math.min(1, Math.min(window_height_g,window_width_g) / width);
                            var heightMinZoom   = Math.min(1, Math.max(window_height_g,window_width_g) / height);
                            $scope.minZoom      = Math.max(widthMinZoom,heightMinZoom);
                            zoomToMin(true);
                        });
                        $scope.selectedImage = imageObj.src;
                        $interval.cancel(lightbox_timer);
                    }
                },100);
            } else {
                $scope.selectedImage = imageObj.src;
                zoomToMin(false);
            }
        });
    };
    $scope.lightboxDoubleTap = function() {
        var scrollDelegate = $ionicScrollDelegate.$getByHandle('lightboxScroll');
        var currentZoom = scrollDelegate.getScrollView().__zoomLevel;
        var zoomLevel = currentZoom > 0.9 ? $scope.minZoom : 1;
        scrollDelegate.zoomTo(zoomLevel,true);
    };

    // --------------- REMOVAL ---------------
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("NOTE_REMOVE_MSG");
    $scope.remove = function(id,event) {
        event.stopPropagation();
        $scope.removeId = id;
        $scope.removeModal.show();
    };
    $scope.confirmRemove = function() {
        loadingService.show("REMOVING_NOTE");
        $timeout(function(){
            picNotesService.remove($scope.policyId,$scope.removeId,$scope.refreshPicNotes);
        },50);
    };
});

