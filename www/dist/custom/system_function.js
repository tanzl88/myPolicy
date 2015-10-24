// UTILITIES ------------------------------------------------------------------------
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
 }
function unique_id() {
	return s4() + s4() + s4() + s4() + s4();
}
function sdbmHash(str) {
    var hash = 0;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = char + (hash << 6) + (hash << 16) - hash;
    }
    return hash;
}
function validity_test(test_subject) {
    if (test_subject !== undefined && test_subject !== null && test_subject !== "") {
        return true;
    } else {
        return false;
    }
}
function isNaN_test(test_subject) {
    if (typeof test_subject === 'number' && isNaN(test_subject)) {
        return true;
    }
    return false;
}
function booleanToInt(test_subject) {
    if (test_subject === true) {
        return 1;
    } else if (test_subject === false) {
        return 0;
    } else {
        return undefined;
    }
}
function parse_boolean(test_subject) {
    if (test_subject === "true" || test_subject === true) {
        return true;
    } else if (test_subject === "false" || test_subject === false) {
        return false;
    } else {
        return undefined;
    }
}
function hash(string) {
    var hash = 0, i, chr, len;
    if (string.length == 0) return hash;
    for (i = 0, len = string.length; i < len; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
function isMobile() {
    if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    }
    else {
        return false;
    }
}

//JQEURY EXTEND
$.fn.scrollTo = function( target, options, callback ){
    if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
    var settings = $.extend({
        scrollTarget  : target,
        offsetTop     : 50,
        duration      : 500,
        easing        : 'swing'
    }, options);
    return this.each(function(){
        var scrollPane = $(this);
        var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
        var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
        scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
            if (typeof callback == 'function') { callback.call(this); }
        });
    });
}


function breakRGBA(colorString) {
    var rgb;
    if (colorString.substr(0,4) === "rgba") {
        rgb = colorString.substring(5, colorString.length-1)
                         .replace(/ /g, '')
                         .split(',');
        for (var i = 0 ; i < rgb.length ; i++) {
            rgb[i] = parseInt(rgb[i]);
        }
        return rgb;
    } else if (colorString.substr(0,4) === "rgb(") {
        rgb = colorString.substring(4, colorString.length-1)
                         .replace(/ /g, '')
                         .split(',');
        for (var i = 0 ; i < rgb.length ; i++) {
            rgb[i] = parseInt(rgb[i]);
        }
        rgb.push(1);
        return rgb;
    } else {
        return undefined;
    }
}


//PARSE DATA
function parseDbInt(input) {
    if (!validity_test(input)) {
        return undefined;
    } else {
        return parseInt(input);
    }
}