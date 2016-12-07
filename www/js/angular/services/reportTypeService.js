app.service('reportTypeService', function($q,$http,$translate,errorHandler) {
    var default_pages = [
        "cover",
        "overview",
        "keyProtections",
        "protectionsTrend",
        "policiesAnalysis",
        "fullTable",
        "needs",
        "netWorth",
        "financialRatios",
        "financialScore",
        "disclaimer"
    ];

    var report_type_g = [
        {
            name    : "Full Report",
            type    : "default",
            pages   : default_pages,
        },
        {
            name    : "Insurance Summary",
            type    : "default",
            pages   : [
                "cover",
                "overview",
                "keyProtections",
                "protectionsTrend",
                "policiesAnalysis",
                "fullTable",
                "needs",
                "disclaimer"
            ]
        },
        {
            name    : "Net Worth Analysis",
            type    : "default",
            pages   : [
                "cover",
                "netWorth",
                "disclaimer"
            ]
        },
        {
            name    : "Financial Ratios",
            type    : "default",
            pages   : [
                "cover",
                "financialRatios",
                "disclaimer"
            ]
        },
        {
            name    : "Financial Score and Protection Score",
            type    : "default",
            pages   : [
                "cover",
                "financialScore",
                "keyProtections",
                "financialRatios",
                "disclaimer"
            ]
        }
    ];

    return {
        init : function(reportTypes) {
            angular.forEach(reportTypes, function(report,index){
                report_type_g.push(report);
            });
        },
        load : function() {
            $http.get(ctrl_url + "get_report_types" + "?decache=" + Date.now())
                .success(function(statusData){
                    console.log(statusData);
                    if (statusData.status === "success") {
                        angular.forEach(statusData.data, function(report,index){
                            report_type_g.push(report);
                        });
                    } else {
                        errorHandler.handleOthers(statusData.status);
                    }
                });
        },
        delete : function(id) {
            var dfd = $q.defer();
            $http.post(ctrl_url + "remove_report_type", {id : id})
                .success(function(result){
                    if (result === "success") {
                        for (var i = 3 ; i < report_type_g.length ; i++) {
                            if (report_type_g[i].id === id) report_type_g.splice(i,1);
                        }
                        dfd.resolve("OK");
                    } else {
                        errorHandler.handleOthers(result);
                        dfd.resolve("ERROR");
                    }
                });

            return dfd.promise;
        },
        getReportTypes : function() {
            return report_type_g;
        },
        setReportType : function(input) {
            var dfd = $q.defer();

            var mode = input.id === undefined ? "NEW" : "EDIT";
            if (mode === "NEW") input.id = unique_id();

            var stringifyInput = angular.copy(input);
            stringifyInput.pages = JSON.stringify(input.pages);

            $http.post(ctrl_url + "set_report_type", stringifyInput)
                .success(function(result){
                    if (result === "success") {
                        input.name = input.reportName;

                        //EDIT CANNOT PUSH
                        if (mode === "NEW") {
                            report_type_g.push(input);
                        } else {
                            for (var i = 3 ; i < report_type_g.length ; i++) {
                                if (report_type_g[i].id === input.id) report_type_g[i] = input;
                            }
                        }
                        dfd.resolve("OK");
                    } else {
                        errorHandler.handleOthers(result);
                        dfd.resolve("ERROR");
                    }
                });

            return dfd.promise;
        }
    }
});
