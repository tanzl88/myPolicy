app.controller('GalleryCtrl', function($scope,$rootScope,$http,$toast,$translate,$timeout,
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
    $scope.refreshPicNotes = function() {
        picNotesService.getPicNotes($scope.policyId).then(function(picId){
            $scope.picNotes = picId;
            $scope.removeModal.hide();
            loadingService.hide();
        });
    };

    $scope.cellStyle = function() {
        var container_width = window_width_g * 0.94;
        var row_width       = container_width * 0.97;
        var cell_width      = (row_width / 2) - 2;
        return {
            width  : cell_width + "px",
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

            //var canvas = document.createElement("canvas");
            //Caman(canvas,imageURI, function(){
            //    this.exposure(40);
            //    this.gamma(1.5);
            //    this.contrast(25);
            //    this.render(function(){
            //        //console.log("SAVING");
            //        console.log(fileCacheDir + identifier + picId + 'CAMAN.jpg');
            //        //console.log(this.save(fileCacheDir + identifier + picId + 'CAMAN.jpg'));
            //        //console.log(this);
            //        this.canvas.toBlob(function(blob){
            //            $cordovaFile.writeFile(fileCacheDir, identifier + picId + 'CAMAN.jpg', blob, true)
            //                .then(function (success) {
            //                    // success
            //                    console.log(success);
            //                    //reportComplete(true);
            //                }, function (error) {
            //                    console.log(error);
            //                    //$toast.show("GENERATE_REPORT_FAILED");
            //                    //reportComplete(false);
            //                    // error
            //                });
            //        }, "image/jpeg", 0.5);
            //    });
                //console.log(this);
                //console.log(this.toImage("jpg"));
                //console.log(identifier + picId + '.jpg');
                //this.save(fileCacheDir + identifier + picId + '.jpg');
            //});


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
    $scope.expand = function(index) {
        $scope.selectedImage = $scope.picNotes[index].src;
        $scope.lightbox.show();
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

        //reminderService.removeReminderById($scope.removeId).then(function(status){
        //    if (status === "OK") {
        //        $scope.reminders = reminderService.get();
        //    } else if (status === "failed") {
        //        $toast.show("REMOVE_POLICY_NOT_FOUND");
        //    }
        //    hideEverything();
        //});
    };
});

