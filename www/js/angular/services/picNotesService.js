app.service('picNotesService', function($q,$http,$toast,$cordovaFile,$cordovaFileTransfer,credentialManager,advisorDataDbService,personalDataDbService,loadingService,errorHandler) {
    function getIdentifier(policyId) {
        var userId = credentialManager.getClientProperty("id");
        return sdbmHash(policyId + userId);
    }

    return {
        getPicNotes : function(policyId) {
            var dfd = $q.defer();
            var thisService = this;
            var input = {
                policyId : policyId
            };
            $http.post(ctrl_url + "get_pic_notes", input)
                .success(function(statusData){
                    if (statusData["status"] === "OK") {
                        var picNotes = [];
                        var promises = [];
                        var identifier = getIdentifier(policyId);
                        //GET FILE FOR EACH FILE ID -> EITHER FROM CACHE OR DOWNLOAD TO CAHCE
                        for (var i = 0 ; i < statusData["data"].length ; i++) {
                            promises.push(thisService.getFile(identifier,statusData["data"][i].picId,policyId,true));
                        }
                        $q.all(promises).then(function(picId){
                            dfd.resolve(picId);
                        });
                    } else {
                        errorHandler.handleOthers(statusData["status"]);
                    }
                });

            return dfd.promise;
        },
        getFullPic : function(policyId,picId) {
            var dfd = $q.defer();
            var identifier = getIdentifier(policyId);
            //GET FILE FOR EACH FILE ID -> EITHER FROM CACHE OR DOWNLOAD TO CAHCE
            this.getFile(identifier,picId,policyId,false).then(function(obj){
                dfd.resolve(obj);
            });
            return dfd.promise;
        },
        getFile : function(identifier,picId,policyId,getThumb) {
            var dfd = $q.defer();
            var thumb = getThumb ? "-thumb" : "";
            var filename      = picId + thumb + ".jpg";
            var cacheFilename = identifier + filename;

            //CHECK CACHE EXISTS
            $cordovaFile.checkFile(fileCacheDir, cacheFilename)
                .then(function (success) {
                    //CACHE FOUND
                    dfd.resolve({
                        id          : picId,
                        policyId    : policyId,
                        src         : fileCacheDir + cacheFilename
                    });
                }, function (error) {
                    if (error.code === 1) {
                        //CACHE NOT FOUND -> DOWNLOAD TO CACHE
                        var url = "https://mypolicyapp.com/repository/" + credentialManager.getClientProperty("id") + "/" + policyId + "/" + filename;
                        var targetPath = fileCacheDir + cacheFilename;
                        var options = {};

                        $cordovaFileTransfer.download(url, targetPath, options, false)
                            .then(function(result) {
                                dfd.resolve({
                                    id          : picId,
                                    policyId    : policyId,
                                    src         : fileCacheDir + cacheFilename
                                });
                            }, function(err) {
                                console.log(err);
                                // Error
                            }, function (progress) {
                                //$scope.downloadProgress = (progress.loaded / progress.total) * 100;
                            });
                    } else {
                        //UNKNOWN ERROR CODE
                        console.log(error);
                    }
                });

            return dfd.promise;
        },
        getLogo : function(forceDownload) {
            var dfd = $q.defer();
            var cacheFilename = "logo.jpg";
            var url = "https://mypolicyapp.com/profile/" + advisorDataDbService.getAdvisorId() + "/logo.jpg";
            var targetPath = fileCacheDir + cacheFilename;
            var options = {};
            forceDownload = forceDownload !== undefined ? forceDownload : false;

            //CHECK CACHE EXISTS
            if (forceDownload) {
                $cordovaFileTransfer.download(url, targetPath, options, false)
                    .then(function(result) {
                        dfd.resolve(fileCacheDir + cacheFilename);
                    }, function(err) {
                        console.log(err);
                        // Error
                    }, function (progress) {
                        //$scope.downloadProgress = (progress.loaded / progress.total) * 100;
                    });
            } else {
                $cordovaFile.checkFile(fileCacheDir, cacheFilename)
                    .then(function (success) {
                        //CACHE FOUND
                        dfd.resolve({
                            src         : fileCacheDir + cacheFilename
                        });
                    }, function (error) {
                        if (error.code === 1) {
                            //CACHE NOT FOUND -> DOWNLOAD TO CACHE
                            $cordovaFileTransfer.download(url, targetPath, options, false)
                                .then(function(result) {
                                    dfd.resolve({
                                        src         : fileCacheDir + cacheFilename
                                    });
                                }, function(err) {
                                    console.log(err);
                                    // Error
                                }, function (progress) {
                                    //$scope.downloadProgress = (progress.loaded / progress.total) * 100;
                                });
                        } else {
                            //UNKNOWN ERROR CODE
                            console.log(error);
                        }
                    });
            }

            return dfd.promise;
        },
        upload : function(imageURI,input) {
            var dfd = $q.defer();
            var options = new FileUploadOptions();
            options.fileName = input.picId + ".jpg";
            options.chunkedMode = false;
            options.params = input;

            var uploadStartTime = Date.now();
            $cordovaFileTransfer.upload(ctrl_url + "set_pic_notes", imageURI, options).then(function(result) {
                //ANALYTICS
                if (ionic.Platform.isWebView()) window.analytics.trackTiming('AJAX', Date.now() - uploadStartTime, 'Upload', 'Picture notes');

                var filename = input.picId + "-thumb.jpg";
                var thumbUrl = "https://mypolicyapp.com/repository/" + credentialManager.getClientProperty("id") + "/" + input.policyId + "/" + filename;
                var dataStatus = {
                    status : "OK",
                    data   : thumbUrl
                };
                dfd.resolve(dataStatus);

            }, function(err) {
                var dataStatus = {
                    status : "error"
                };
                loadingService.hide();
                dfd.resolve(dataStatus);
            }, function (progress) {
                var percent = (progress.loaded / progress.total * 100).toFixed(0);
                loadingService.showWithVar("UPLOADING",{
                    percent : percent
                });
            });

            return dfd.promise;
        },
        remove : function(policyId,picId,callback) {
            var thisService = this;
            var input = {
                policyId : policyId,
                picId    : picId
            };
            $http.post(ctrl_url + "remove_pic_notes", input)
                .success(function(status){
                    if (status === "OK") {
                        //REMOVE FROM CACHE
                        thisService.getPicNotes(policyId);
                        $cordovaFile.removeFile(fileCacheDir, getIdentifier(policyId) + picId + ".jpg")
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                                console.log(error);
                            });
                        $cordovaFile.removeFile(fileCacheDir, getIdentifier(policyId) + picId + "-thumb.jpg")
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                                console.log(error);
                            });
                        if (validity_test(callback)) callback();
                    }
                });
        },
        uploadProfile : function(imageURI,input) {
            var thisService = this;
            var dfd = $q.defer();
            var credential = credentialManager.getCredential();
            var filename = credential === "advisor" ? "logo.jpg" : "profile.jpg";
            var options = new FileUploadOptions();
            options.fileName = filename;
            options.chunkedMode = false;
            options.params = input;

            var uploadStartTime = Date.now();
            $cordovaFileTransfer.upload(ctrl_url + "set_profile_pic", imageURI, options).then(function(result) {
                //ANALYTICS
                if (ionic.Platform.isWebView()) window.analytics.trackTiming('AJAX', Date.now() - uploadStartTime, 'Upload', 'Logo');

                var userId = credential === "advisor" ? advisorDataDbService.getAdvisorId() : personalDataDbService.getUserId();
                var picUrl = "https://mypolicyapp.com/profile/" + userId + "/" + filename;
                thisService.getLogo(true).then(function(cacheUrl){
                    var dataStatus = {
                        status : "OK",
                        data   : cacheUrl
                    };
                    dfd.resolve(dataStatus);
                });
            }, function(err) {
                var dataStatus = {
                    status : "error"
                };
                loadingService.hide();
                dfd.resolve(dataStatus);
            }, function (progress) {
                var percent = (progress.loaded / progress.total * 100).toFixed(0);
                loadingService.showWithVar("UPLOADING",{
                    percent : percent
                });
            });

            return dfd.promise;
        },
        removeProfile : function(callback) {
            var thisService = this;
            $http.post(ctrl_url + "remove_profile_pic", {})
                .success(function(status){
                    console.log(status);
                    if (status === "OK") {
                        //REMOVE FROM CACHE
                        $cordovaFile.removeFile(fileCacheDir, "logo.jpg")
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                                console.log(error);
                            });
                        if (validity_test(callback)) callback();
                    }
                });
        },
    }
});