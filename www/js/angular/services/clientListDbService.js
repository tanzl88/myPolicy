app.service('clientListDbService', function($rootScope,$q,$http,$translate,errorHandler) {
    var clients_g;
    $rootScope.$on("LOGOUT", function(){
        client_g = null;
    });

    function parseDate(dateString) {
        if (!validity_test(dateString) || dateString === "0000-00-00") {
            return undefined;
        } else {
            return moment(dateString,"YYYY-MM-DD");
        }
    }
    function calcNextBirthday(momentBirthday) {
        var momentToday   = moment();
        var momentNow     = moment([momentToday.year(),momentToday.month(),momentToday.date()]);
        var thisYear = momentToday.year();
        var month    = momentBirthday.month();
        var date     = momentBirthday.date();
        var thisYearBirthday = moment([thisYear,month,date]);
        if (momentNow.isBefore(thisYearBirthday,"day")) {
            var nextBirthday = thisYearBirthday;
            return thisYearBirthday.diff(momentNow,"day");

        } else if (momentNow.isAfter(thisYearBirthday,"day")) {
            var nextBirthday = moment([thisYear + 1,month,date]);
            return nextBirthday.diff(momentNow,"day");
        } else {
            return 0;
        }
    }

    return {
        refresh : function() {
            var dfd = $q.defer();
            var thisService = this;
            $http.post(ctrl_url + "refresh_client_list", {})
                .success(function(dataStatus){
                    if (dataStatus.status === "OK") {
                        thisService.set(dataStatus.data.clients,dataStatus.data.temp);
                        dfd.resolve("OK");
                    } else {
                        errorHandler.handleOthers(dataStatus.status);
                    }
                });
            return dfd.promise;
        },
        set : function(clientList,tempAccountList) {
            clients_g = this.processClientsArray(clientList,tempAccountList);
        },
        processClientsArray : function(clientArray,tempAccountList) {
            var output = [];
            angular.forEach(clientArray, function(client,index){
                var displayName = validity_test(client.name) ? client.name : client.email;
                var client = {
                    id       : client.userId,
                    name     : displayName,
                    birthday : parseDate(client.birthday),
                    type     : "link"
                };
                output.push(client);
            });

            angular.forEach(tempAccountList, function(temp,index){
                var client = {
                    temp : temp.id,
                    id   : temp.userId,
                    name : temp.accountName,
                    birthday : parseDate(temp.birthday),
                    type : "temp"
                };
                output.push(client);
            });
            return output;
        },
        getClients : function() {
            return clients_g;
        },
        removeClient : function(id) {
            for (var i = 0 ; i < clients_g.length ; i++) {
                if (clients_g[i].id === id) {
                    clients_g.splice(i,1);
                    break;
                }
            }
        }
    }
});