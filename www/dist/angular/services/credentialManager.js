app.service('credentialManager', ['$rootScope', '$state', '$toast', 'modalService', function($rootScope,$state,$toast,modalService) {
    var credential_g;
    var subscription_g;
    var client_selected_g = false;
    var client_selected_obj_g;

    var scope = $rootScope.$new();
    scope.hide = function() {
        scope.upgradeAccountModal.hide();
    };
    scope.goToUpgradeAccount = function() {
        scope.hide();
        $state.go("upgradeAccount");
    };
    $rootScope.$on("LOGOUT", function(){
        credential_g = null;
        subscription_g = null;
        client_selected_obj_g = {};
        client_selected_g = false;
        $("#home_view").scope().refreshClientName();
    });

    return {
        setCredential : function(credential) {
            credential_g = credential;
        },
        getCredential : function() {
            return credential_g;
        },
        setSubscription : function(subscription) {
            subscription.type = parseInt(subscription.type);
            subscription_g = subscription;
            console.log(subscription_g);
        },
        getSubscription : function() {
            return subscription_g;
        },
        setClientSelected : function() {
            client_selected_g = true;
        },
        removeClientSelected : function() {
            client_selected_g = false;
        },
        getClientSelected : function() {
            return client_selected_g;
        },

        setClientSelectedObj : function(obj) {
            client_selected_obj_g = obj;

            if (this.getCredential() === "advisor") {
                this.setClientSelected();

                //REFRESH NAME AND SHOW TOAST
                $("#home_view").scope().refreshClientName();
                $toast.show("SIGN_IN_AS", {
                    name : this.getClientProperty("name")
                });
            }
        },
        removeClientSelectedObj : function() {
            client_selected_obj_g = {};
            this.removeClientSelected();
            $("#home_view").scope().refreshClientName();
        },
        getClientProperty : function(propertyName) {
            if (client_selected_obj_g === undefined) {
                return undefined;
            } else {
                return client_selected_obj_g[propertyName];
            }
        },
        showUpgradeAccountModal : function() {
            if (scope.upgradeAccountModal === undefined) {
                modalService.init("upgrade_account","upgrade_account",scope).then(function(modal){
                    scope.upgradeAccountModal = modal;
                    scope.upgradeAccountModal.show();
                });
            } else {
                scope.upgradeAccountModal.show();
            }
        },
        hideUpgradeAccountModal : function() {
            scope.upgradeAccountModal.hide();
        }
    }
}]);