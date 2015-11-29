app.service('clientListDbService', ['$rootScope', '$q', '$http', '$translate', 'credentialManager', 'loadingService', 'errorHandler', function($rootScope,$q,$http,$translate,credentialManager,loadingService,errorHandler) {
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
                    type : "temp",
                    accountCreated : moment(temp.accountCreated)
                };
                output.push(client);
            });
            return output;
        },
        getClients : function() {
            return clients_g;
        },
        //removeClient : function(id) {
        //    for (var i = 0 ; i < clients_g.length ; i++) {
        //        if (clients_g[i].id === id) {
        //            clients_g.splice(i,1);
        //            break;
        //        }
        //    }
        //},
        removeClient : function(id) {
            var dfd = $q.defer();

            for (var i = 0 ; i < clients_g.length ; i++) {
                if (clients_g[i].id === id) {
                    var removeType = clients_g[i]["type"];
                    if (removeType === "temp") id = clients_g[i]["temp"];
                    clients_g.splice(i,1);
                    break;
                }
            }

            if (removeType === "link") {
                $http.post(ctrl_url + "remove_linked_account", {id : id})
                    .success(function(status){
                        if (status === "success") {
                            dfd.resolve("OK");
                        } else {
                            errorHandler.handleOthers(status);
                        }
                    });
            } else if (removeType === "temp") {
                $http.post(ctrl_url + "remove_temp_account", {id : id})
                    .success(function(status){
                        if (status === "success") {
                            dfd.resolve("OK");
                        } else if (status === "not_found") {
                            dfd.resolve("not_found");
                        } else {
                            errorHandler.handleOthers(status);
                        }
                    });
            }

            return dfd.promise;
        },
        selectClient : function(client) {
            var dfd = $q.defer();

            loadingService.show("LOADING_CLIENT");
            $http.post(ctrl_url + "get_client_data", {userId : client.id})
                .success(function(data){
                    if (data.status === "OK") {
                        credentialManager.setClientSelectedObj(client);
                        loadingService.hide();
                    } else {
                        errorHandler.handleOthers(data.status);
                    }
                    dfd.resolve(data);
                });

            return dfd.promise;
        }
    }
}]);