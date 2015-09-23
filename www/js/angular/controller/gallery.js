app.controller('GalleryCtrl', function($scope,$rootScope,$http,$toast,$translate,$timeout,$interval,$ionicScrollDelegate,
                                       $cordovaCamera,$cordovaFile,$cordovaFileTransfer,
                                       picNotesService,loadingService,modalService) {
    $scope.initVar = function() {
        $scope.policyId = $rootScope.policyId;
        $scope.userId   = $rootScope.userId;
        delete $rootScope.policyId;
        delete $rootScope.userId;

        loadingService.show("LOADING_IMAGES");
        $scope.refreshPicNotes();
    };
    var lightboxOnLoadListener = false;

    $scope.refreshPicNotes = function() {
        picNotesService.getPicNotes($scope.policyId).then(function(picId){
            $scope.picNotes = picId;
            $scope.removeModal.hide();
            loadingService.hide();
        });
    };

    $scope.cellStyle = function() {
        var division = 2;
        var container_width = window_width_g - 2;
        var cell_width = (container_width / division) - 2;

        return {
            //width  : cell_width + "px",
            height : cell_width + "px"
        }
    };

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

            var lastSlashPosition = imageURI.lastIndexOf("/");
            var path              = imageURI.substr(0,lastSlashPosition + 1);
            var filename          = imageURI.substr(lastSlashPosition + 1);
            var identifier        = sdbmHash($scope.policyId + $scope.userId);
            var picId             = unique_id();

            var input = {
                policyId : $scope.policyId,
                picId    : picId
            };
            $timeout(function(){
                picNotesService.upload(imageURI,input).then(function(status){
                    if (status === "OK") {
                        $cordovaFile.moveFile(path, filename, fileCacheDir, identifier + picId + ".jpg")
                            .then(function (fileEntry) {
                                $scope.picNotes.push({
                                    id  : picId,
                                    policyId : $scope.policyId,
                                    src : fileEntry.nativeURL
                                });
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

        }, function(err) {
            console.log(err);
            // error
        });
    };

    //LIGHTBOX
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
                            var width = this.clientWidth;
                            var height = this.clientHeight;
                            //var zoomLevel = width < height ? window_height_g / height : window_width_g / width;
                            $scope.minZoom = window_height_g / height;
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
    //REMOVE
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

