app.service('loadingService', ['$interval', '$translate', function ($interval,$translate) {
    var dots_timer;
    var dots_max_length = 4;
    var generate_dots = function(length) {
        var dots_string = "";
        for (var i = 0; i < length; i++) {
            dots_string += ".";
        }
        return dots_string;
    };
    var start_dots = function (loading_text) {
        var dots_string = "";
        $("#loading_text").text(loading_text);

        if (dots_timer) {
            $interval.cancel(dots_timer);
            delete dots_timer;
        }

        dots_timer = $interval(function () {
            var next_length = dots_string.length % dots_max_length + 1;
            dots_string = generate_dots(next_length);
            $("#loading_text").text(loading_text + dots_string);
        }, 600);
    };
    var stop_dots = function () {
        if (angular.isDefined(dots_timer)) {
            $interval.cancel(dots_timer);
            delete dots_timer;
            $("#loading_text").text("");
        }
    };

    return {
        show: function (loading_text,opacity) {
            var opacity = validity_test(opacity) ? opacity : 0.95;
            var translated_loading_text = $translate.instant(loading_text);
            start_dots(translated_loading_text);
            $("#global_blocker").css("background-color","rgba(255,255,255," + opacity + ")");
            $("#global_blocker").show();
        },
        showWithVar: function (loading_text,variable) {
            var translated_loading_text = $translate.instant(loading_text,variable);
            $("#loading_text").text(translated_loading_text);
            $("#global_blocker").css("background-color","rgba(255,255,255,0.95)");
            $("#global_blocker").show();
        },
        hide: function () {
            $("#global_blocker").hide();
            stop_dots();
        }
    }
}]);