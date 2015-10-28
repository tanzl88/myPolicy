app.controller('AskQuestionCtrl', ['$scope', '$http', '$toast', '$ionicScrollDelegate', '$cordovaEmailComposer', '$translate', '$timeout', '$ionicHistory', 'utilityService', 'advisorDataDbService', 'loadingService', 'modalService', 'errorHandler', function($scope,$http,$toast,$ionicScrollDelegate,
                                           $cordovaEmailComposer,$translate,$timeout,$ionicHistory,utilityService,
                                           advisorDataDbService,loadingService,modalService,errorHandler) {
    $scope.initVar = function() {
        //SCROLL TO TOP
        $ionicScrollDelegate.$getByHandle('askQuestion').scrollTop();

        //DEFAULT VALUE AND SET PRISTINE
        $scope.confirmDetails = false;
        $scope.viewObj = {
            subject : {
                text : "Contact an advisor"
            },
            contact : undefined,
            body    : undefined
        };
        $timeout(function(){
            $("#sendFeedbackForm").scope().sendFeedbackForm.$setPristine();
        },100);
    };
    $scope.feedbackContactPlaceholder = $translate.instant("FEEDBACK_CONTACT_PLCHDR");
    $scope.feedbackBodyPlaceholder = $translate.instant("FEEDBACK_BODY_PLCHDR");

    // --------------- FEEDBACK (IF NOT LINKED) ---------------
    $scope.categories = [
        {
            text : "Feedback",
        },
        {
            text : "Contact an advisor",
        },
        {
            text : "Ask a question",
        },
        {
            text : "Others"
        }
    ];

    $scope.sendFeedback = function(form) {
        //ANALYTICS
        if (ionic.Platform.isWebView()) window.analytics.trackEvent('User Interaction', 'Feedback', 'Submit');


        //HIDE KEYBOARD UPON SUBMIT
        var delay_time = utilityService.getKeyboardDelay();
        $timeout(function(){
            if (form.$invalid) {
                form.contact.$setDirty();
                form.body.$setDirty();
            } else {
                var input = {
                    subject: $scope.viewObj.subject.text,
                    content: form.body.$modelValue + "  My preferred contact: " + form.contact.$modelValue,
                };

                $http.post(ctrl_url + "send_feedback_email",input)
                    .success(function(status){
                        if (status === "OK") {
                            $scope.thanksMail.show();
                            $ionicHistory.goBack();
                        } else {
                            errorHandler.handleOthers(status);
                        }
                    });
            }
        },delay_time);
    };

    modalService.init("thanks_mail","thanks_mail",$scope).then(function(modal){
        $scope.thanksMail = modal;
    });
}]);
