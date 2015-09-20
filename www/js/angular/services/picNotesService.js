app.service('picNotesService', function($q,$http,$toast,$cordovaFile,$cordovaFileTransfer,credentialManager,loadingService,errorHandler) {
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
                            promises.push(thisService.getFile(identifier,statusData["data"][i].picId,policyId));
                        }
                        $q.all(promises).then(function(picId){
                            dfd.resolve(picId);
                        });
                    } else {
                        errorHandler.handleOthers(statusData["status"],policyId);
                    }
                });

            return dfd.promise;
        },
        getFile : function(identifier,picId,policyId) {
            var dfd = $q.defer();
            var filename      = picId + ".jpg";
            var cacheFilename = identifier + filename;

            //CHECK CACHE EXISTS
            $cordovaFile.checkFile(fileCacheDir, cacheFilename)
                .then(function (success) {
                    //CACHE FOUND
                    dfd.resolve({
                        id  : picId,
                        src : fileCacheDir + cacheFilename
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
                                    id  : picId,
                                    src : fileCacheDir + cacheFilename
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
        upload : function(imageURI,input) {
            var dfd = $q.defer();
            var options = new FileUploadOptions();
            options.fileName = input.picId + ".jpg";
            options.chunkedMode = false;
            options.params = input;

            $cordovaFileTransfer.upload(ctrl_url + "set_pic_notes", imageURI, options).then(function(result) {
                dfd.resolve("OK");
            }, function(err) {
                dfd.resolve("error");
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
                                console.log(success);
                                if (validity_test(callback)) callback();
                            }, function (error) {
                                // error
                                console.log(error);
                                loadingService.hide();
                            });
                    }
                });
        }
    }
});