app.service('storeService', function($http,$q,$ionicHistory,advisorDataDbService,credentialManager,loadingService,errorHandler) {

    function registerListeners(product_id) {
        //store.when(product_id).updated(function(product){
        //    alert("UPDATED: " + JSON.stringify(product));
        //});
        store.when(product_id).cancelled(function(product){
            //alert("CANCELLED: " + JSON.stringify(product));
            loadingService.hide();
        });
        store.when(product_id).approved(function(product){
            console.log("APPROVED");

            var input = {
                type   : getTypeId(product),
                expiry : moment().add(1,"year").format("LL")
            };
            submitToDatabase(input).then(function() {
                product.finish();
                $ionicHistory.goBack();
                loadingService.hide();
            }, function(err){

            });
        });
    }

    function getProductType() {
        if (ionic.Platform.isAndroid()) {
            return store.CONSUMABLE;
        } else {
            return store.NON_RENEWING_SUBSCRIPTION;
        }
    }
    function getTypeId(product) {
        if (product.id === "silver_subscription") {
            return 1;
        } else if (product.id === "gold_subscription") {
            return 2
        } else {
            return 0;
        }
    }
    function submitToDatabase(input) {
        var dfd = $q.defer();
        $http.post(ctrl_url + "set_subscription", input)
            .success(function(dataStatus){
                if (dataStatus.status === "SUCCESS") {
                    credentialManager.setSubscription(input);
                    dfd.resolve("SUCCESS");
                } else {
                    errorHandler.handleOthers(dataStatus.status);
                    dfd.reject();
                }
            });
        return dfd.promise;
    }

    return {
        init : function() {
            //DEBUG
            store.verbosity = store.DEBUG;
            // Log all errors
            store.error(function(error) {
                log('ERROR ' + error.code + ': ' + error.message);
            });

            //REGISTER PRODUCTS
            store.register({
                id:    "silver_subscription",
                alias: "Silver Subscription",
                type: getProductType(),
                typeId: 1
            });
            store.register({
                id:    "gold_subscription",
                alias: "Gold Subscription",
                type:  getProductType(),
                typeId: 2
            });

            //GET PRODUCTS WHEN STORE IS READY
            store.ready(function() {
                console.log("\\o/ STORE READY \\o/");
                var silver = store.get("silver");
                var gold = store.get("gold");
            });

            //REFRESH
            store.refresh();

            //START LISTENING FOR CANCEL, APPROVED
            registerListeners("silver_subscription");
            registerListeners("gold_subscription");
        },
        order : function(product_id) {
            var product = store.get(product_id);
            console.info("ORDERING",product);
            if (product.canPurchase) {

                loadingService.show("Loading");

                //DOUBLE CHECK WHETHER SESSION IS EXPIRED BEFORE START ORDERING
                advisorDataDbService.init().then(function(status){
                    if (status === "OK") {
                        store.order(product_id);
                    } else {
                        loadingService.hide();
                    }
                });
            }

        }
    }
});