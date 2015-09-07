app.controller('GenerateReportCtrl', function($scope,$rootScope,$q,$state,$translate,$toast,credentialManager,
                                              $cordovaFile,$cordovaFileOpener2,$cordovaEmailComposer,
                                              loadingService,modalService,utilityService) {

    // ------------ FILE UTILITY ------------
    function listDir(dirInput) {
        var dfd = $q.defer();
        $cordovaFile.checkDir(dirInput,"")
            .then(function(dir) {
                // LIST DIRECTORY
                dir.createReader().readEntries(
                    //IF SUCCESS
                    function(files){
                        var fileList = [];
                        var promises = [];

                        // WAIT FOR FILE OBJ PROMISES
                        // WHEN DONE RESOLVE FILE LIST
                        angular.forEach(files, function(file,index){
                            if (file.isFile) promises.push(getFileObj(file));
                        });
                        $q.all(promises).then(function(result){
                            angular.forEach(result,function(fileObj){
                                fileList.push(fileObj);
                            });
                            dfd.resolve({
                                status : "OK",
                                data  : fileList
                            });
                        });
                    },function(error){
                        dfd.resolve({
                            status : "reader_error"
                        });
                    });
            }, function (error) {
                dfd.resolve({
                    status : "dir_error"
                });
            });

        return dfd.promise;
    }

    function getFileObj(file) {
        var dfd = $q.defer();
        file.file(function(result){
            var fileObj = {
                lastModified : moment(result.lastModifiedDate,"x"),
                name         : result.name
            };
            dfd.resolve(fileObj);
        });
        return dfd.promise;
    }

    function runIfFilenameValid(filename,callback) {
        $cordovaFile.checkFile(fileTransferDir,filename)
            .then(function(file) {
                if (file.nativeURL) {
                    callback(file.nativeURL);
                } else {
                    $toast.show("FILE_NOT_FOUND");
                }
            }, function (error) {
                console.log(error);
                $toast.show("FILE_NOT_FOUND");
            });
    }

    function removeFile(dir,filename) {
        $cordovaFile.removeFile(dir,filename)
            .then(function(success){
                $scope.closeRemoveModal();
                $scope.initVar();
            }, function(error){
                $toast.show("UNKNOWN_ERROR");
            });
    }


    // ------------ MENU ACTION ------------
    $scope.openFile = function(index) {
        var filename = $scope.fileList[index].name;
        runIfFilenameValid(filename,function(nativeUrl){
            console.log(decodeURIComponent(nativeUrl));
            $cordovaFileOpener2.open(decodeURIComponent(nativeUrl),'application/pdf').then(function(result){
                //TEST ON IOS TO DECIDE
            }, function(error){
                console.log(error);
                $toast.show("FILE_OPEN_ERROR");
            });
        });
    };
    $scope.email = function(index) {
        //console.log("EMAIL");
        var filename = $scope.fileList[index].name;
        runIfFilenameValid(filename,function(nativeUrl){
            var email = {
                attachments: nativeUrl,
                subject: 'Insurance Summary',
                isHtml: true
            };
            $cordovaEmailComposer.open(email).then(null, function () {
                // user cancelled email
            });
        });
    };
    $scope.remove = function(index) {
        //$scope.openRemoveModal();
        $scope.removeModal.show();
        $scope.removeIndex = index;
    };
    $scope.confirmRemove = function() {
        var removeIndex = $scope.removeIndex;
        delete $scope.removeIndex;
        var filename = $scope.fileList[removeIndex].name;
        removeFile(fileTransferDir,filename);
    };

    // ------------ NEW REPORT ------------

    $scope.generateReport = function() {
        if (ionic.Platform.isWebView() && !$scope.clientSelected) {
            $toast.showClientNotSelected();
        } else {
            $scope.generateReportModal.show();
            utilityService.resetForm("reportNameForm",{
                reportName : undefined
            });
        }
        //    if ($scope.clientSelected) {
        //        $scope.generateReportModal.show();
        //        utilityService.resetForm("reportNameForm",{
        //            reportName : undefined
        //        });
        //    } else {
        //        $toast.showClientNotSelected();
        //    }
        //} else {
        //    $scope.generateReportModal.show();
        //    utilityService.resetForm("reportNameForm",{
        //        reportName : undefined
        //    });
        //}
    };
    $scope.export = function(form) {
        if (form.$invalid) {
            form.reportName.$setDirty();
        } else {
            var filename = form.reportName.$modelValue + ".pdf";


            //$scope.closeModal();
            //loadingService.show("GENERATING_REPORT",1);
            //$rootScope.reportName = filename;
            //$state.go("tabs.home.generateReport.export");


            //CHECK FILE EXIST
            $cordovaFile.checkFile(fileTransferDir,filename)
                .then(function (file) {
                    $toast.show("REPORT_SAME_NAME");
                }, function (error) {
                    if (error.code === 1) {
                        //EXPORT
                        //$scope.closeModal();
                        $scope.generateReportModal.hide();
                        loadingService.show("GENERATING_REPORT",1);
                        $rootScope.reportName = filename;
                        $state.go("tabs.home.generateReport.export");
                    } else {
                        console.log(error);
                        $toast.show("UNKNOWN_ERROR");
                    }
                });
        }
    };

    // ------------ INIT VAR ------------
    $scope.initVar = function() {
        $scope.clientSelected = credentialManager.getClientSelected();
        listDir(fileTransferDir).then(function(result){
            if (result.status === "OK") {
                $scope.fileList = result.data;
            } else if (result.status === "reader_error") {
                $toast.show("DIR_READER_ERROR");
            } else if (result.status === "dir_error") {
                $toast.show("DIR_NOT_FOUND");
            } else {
                $toast.show("UNKNOWN_ERROR");
            }
        });
    };



    // ------------- MODAL -------------
    modalService.init("generate_report","generate_report",$scope).then(function(modal){
        $scope.generateReportModal = modal;
    });
    modalService.init("remove_modal","remove_modal",$scope).then(function(modal){
        $scope.removeModal = modal;
    });
    $scope.removeMessage = $translate.instant("PDF_REMOVE_MSG");
});