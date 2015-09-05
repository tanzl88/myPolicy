app.service('personalDataDbService', function($rootScope,$q,$http,$translate) {
    var personal_g;
    var profile_found_g = false;
    $rootScope.$on("LOGOUT", function(){
        personal_g = undefined;
        profile_found_g = false;
    });

    function parseDate(dateString) {
        if (!validity_test(dateString) || dateString === "0000-00-00") {
            return undefined;
        } else {
            return moment(dateString,"YYYY-MM-DD");
        }
    };
    function parseDbInt(input) {
        if (!validity_test(input)) {
            return undefined;
        } else {
            return parseInt(input);
        }
    };


    return {
        init : function() {
            var thisService = this;
            var dfd = $q.defer();
            $http.get(ctrl_url + "get_personal_settings" + "?decache=" + Date.now())
                .success(function(personalSettings){
                    personal_g = thisService.processPersonalArray(personalSettings);
                    dfd.resolve("OK");
                });

            return dfd.promise;
        },
        set : function(array) {
            personal_g = this.processPersonalArray(array);
        },
        processPersonalArray : function(personalSettingsArray) {
            profile_found_g = (validity_test(parseDbInt(personalSettingsArray.gender))) ? true : false;
            var birthday = parseDate(personalSettingsArray.birthday);
            var year     = validity_test(birthday) ? birthday.year() : undefined;
            var month    = validity_test(birthday) ? birthday.month() + 1 : undefined;
            var day      = validity_test(birthday) ? birthday.date() : undefined;

            var output = {
                id              : personalSettingsArray.id,
                name            : personalSettingsArray.name,
                gender          : parseDbInt(personalSettingsArray.gender),
                genderDisplayed : gender_enum_g[parseDbInt(personalSettingsArray.gender)],
                smoker          : parseDbInt(personalSettingsArray.smoker),
                smokerDisplayed : smoker_enum_g[parseDbInt(personalSettingsArray.smoker)],
                income          : parseDbInt(personalSettingsArray.income),
                expenditure     : parseDbInt(personalSettingsArray.expenditure),
                birthday        : birthday,
                year            : year,
                month           : month,
                day             : day
            };
            console.log(output);
            return output;
        },
        getData : function() {
            if (personal_g === undefined || personal_g.length === 0) {
                var temp = {
                    income : 0,
                    expenditure : 0
                };
                return temp;
            } else {
                return personal_g;
            }
        },
        profileFound : function() {
            return profile_found_g;
        }
    }
});