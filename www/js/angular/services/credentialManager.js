app.service('credentialManager', function($rootScope,$toast) {
    var credential_g;
    var subscription_g;
    var client_selected_g = false;
    var client_selected_obj_g;

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
        }
    }
});