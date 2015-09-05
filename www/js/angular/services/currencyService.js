app.service('currencyService', function(currencyLoader,$translate) {
    //var currency_g;

    return {
        setCurrency : function(index) {
            localStorage.setItem("currency",index);
            var label = currency_list_g[index].label;
            var symbol = currency_list_g[index].symbol;
            currency_g = validity_test(symbol) ? symbol : label;
            currency_label_g = label;
            $translate.refresh("en");
        },
        getCurrency : function() {
            return currency_g;
        }
    }
});