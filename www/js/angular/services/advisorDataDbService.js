app.service('advisorDataDbService', function($rootScope,$q,$http,$translate,errorHandler) {
    var advisor_g;
    var advisor_profile_found_g = false;

    function parseDbInt(input) {
        if (!validity_test(input)) {
            return undefined;
        } else {
            return parseInt(input);
        }
    };
    $rootScope.$on("LOGOUT", function(){
        advisor_g = null;
        advisor_profile_found_g = null;
    });

    return {
        init : function() {
            var thisService = this;
            var dfd = $q.defer();
            $http.get(ctrl_url + "get_advisor_profile" + "?decache=" + Date.now())
                .success(function(statusData){
                    if (statusData.status === "OK") {
                        advisor_g = thisService.processAdvisorProfile(statusData.data);
                        dfd.resolve("OK");
                    } else {
                        errorHandler.handleOthers(statusData.status);
                        dfd.resolve("ERROR");
                    }

                });

            return dfd.promise;
        },
        set : function(array) {
            advisor_g = this.processAdvisorProfile(array);
        },
        processAdvisorProfile : function(advisorProfileArray) {
            advisor_profile_found_g = (validity_test(advisorProfileArray.name)) ? true : false;
            var output = {
                name            : advisorProfileArray.name,
                title           : advisorProfileArray.title,
                company         : advisorProfileArray.company,
                repNo           : advisorProfileArray.repNo,
                address         : advisorProfileArray.address,
                phone           : advisorProfileArray.phone,
                email           : advisorProfileArray.email,
                website         : advisorProfileArray.website,
                education       : advisorProfileArray.education,
            };

            return output;
        },
        getData : function() {
            if (advisor_g === undefined || advisor_g.length === 0) {
                var temp = {

                };
                return temp;
            } else {
                return advisor_g;
            }
        },
        profileFound : function() {
            return advisor_profile_found_g
        }
    }
});