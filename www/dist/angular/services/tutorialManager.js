app.service('tutorialManager', ['$rootScope', function($rootScope) {
    var tutorial;
    $rootScope.$on("LOGOUT", function(){
        tutorial = null;
    });

    function getSrc(type) {
        if (type === "swipe-left-tutorial") {
            return "img/swipe-left-tutorial.gif";
        } else if (type === "rotate-landscape-tutorial") {
            return "img/device-landscape-tutorial.jpg";
        }
    }
    return {
        show : function(name) {
            $("#tut_pic").attr("src",getSrc(name));
            $("#tutorial_blocker").fadeIn(333);
            tutorial = name;
        },
        hide : function() {
            $("#tutorial_blocker").fadeOut(333);
            localStorage.setItem(tutorial,true);
            tutorial = undefined;
        }
    }
}]);