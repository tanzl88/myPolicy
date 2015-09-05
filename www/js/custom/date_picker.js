//UTILITY
function get_moment_last_day(moment_date) {
    var last_day_of_month = moment_date.clone().add(1,'months').date(1).subtract(1,'days');
    return last_day_of_month;
}


//CALENDAR SWIPER
var swiperYear = {};
var swiperMonth = {};
var swiperDay = {};
var swiperHour = {};
var swiperMinute = {};
var swiperFormat = {};

function get_swiper_options(initialSlideIndex) {
    var date_swiper_options = {
        direction: "vertical",
        slidesPerView: 3,
        initialSlide: initialSlideIndex,
        centeredSlides: true,
        spaceBetween: 10,
        freeMode: true,
        freeModeMomentumRatio: 0.6,
        freeModeSticky: true
    };
    return date_swiper_options;
}


function year_scroll(container,initialValueInput,minYear,maxYear) {
    var swiper_wrapper = $(".year .swiper-wrapper",container);
    if ($(swiper_wrapper).html() === "") {
        var template = "";
        for (var i = minYear ; i < maxYear + 1 ; i++) {
            template += '<div class="swiper-slide align-center ' + i + '">' + i + '</div>';
        }
        $(swiper_wrapper).append(template);
    }

    var initialValue = initialValueInput !== undefined ? parseInt(initialValueInput) : moment().year();
    var initialSlideIndex = initialValue - minYear;
    var date_swiper_options_adj = get_swiper_options(initialSlideIndex);
    date_swiper_options_adj["onTransitionEnd"] = function(swiper,event){
        adjust_day_scroll(container);
    };
    if (swiperYear[container] === undefined) {
        swiperYear[container] = new Swiper(container + ' .year', date_swiper_options_adj);
    } else {
        swiperYear[container].slideTo(initialSlideIndex,0);
    }
}
function month_scroll(container,initialValueInput) {
    var swiper_wrapper = $(".month .swiper-wrapper",container);
    if ($(swiper_wrapper).html() === "") {
        var template = "";
        for (var i = 1 ; i < 13 ; i++) {
            template += '<div class="swiper-slide align-center ' + i + '">' + i + '</div>';
        }
        $(swiper_wrapper).append(template);
    }
    var initialSlideIndex = initialValueInput !== undefined ? parseInt(initialValueInput) : moment().month();
    var date_swiper_options_adj = get_swiper_options(initialSlideIndex);
    date_swiper_options_adj["onTransitionEnd"] = function(swiper,event){
        adjust_day_scroll(container);
    };
    if (swiperMonth[container] === undefined) {
        swiperMonth[container] = new Swiper(container + ' .month', date_swiper_options_adj);
    } else {
        swiperMonth[container].slideTo(initialSlideIndex,0);
    }
}
function day_scroll(container,initialValueInput) {
    var swiper_wrapper = $(".day .swiper-wrapper",container);
    if ($(swiper_wrapper).html() === "") {
        var template = "";
        for (var i = 1 ; i < 32 ; i++) {
            template += '<div class="day-slide swiper-slide align-center ' + i + '">' + i + '</div>';
        }
        $(swiper_wrapper).append(template);
    }
    var initialSlideIndex = initialValueInput !== undefined ? parseInt(initialValueInput) - 1 : moment().date();
    if (swiperDay[container] === undefined) {
        swiperDay[container] = new Swiper(container + ' .day', get_swiper_options(initialSlideIndex));
    } else {
        swiperDay[container].slideTo(0,0);
        swiperDay[container].slideTo(parseInt(initialSlideIndex),0);
    }
    adjust_day_scroll(container);
}
function adjust_day_scroll(container) {
    if (swiperDay[container] !== undefined) {
        var swiper_wrapper = $(".day .swiper-wrapper",container);
        if (swiper_wrapper.length > 0) {
            var year = $(container + " .year .swiper-slide-active").text();
            var month = $(container + " .month .swiper-slide-active").text();
            var last_day = get_moment_last_day(moment([year,month - 1,1])).date();
            var days = $(container + " .day .day-slide");

            //SWIPE TO LAST IF HIDE SELECTED
            var selected_day = $(container + " .day .swiper-slide-active").text();
            if (selected_day > last_day) {
                swiperDay[container].slideTo(last_day - 1,100);
            }

            //SHOW AND HIDE DAYS ACCORDING TO LAST DAY OF THE MONTH
            for (var i = 28 ; i < 31 ; i++) {
                if (i >= last_day) {
                    $(days[i]).hide().removeClass("swiper-slide");
                } else {
                    $(days[i]).show().addClass("swiper-slide");
                }
            }
            swiperDay[container].update();
        }
    }
}

function hour_scroll(container,initialValueInput) {
    var swiper_wrapper = $(".hour .swiper-wrapper",container);
    if ($(swiper_wrapper).html() === "") {
        var template = "";
        for (var i = 0 ; i < 24 ; i++) {
            template += '<div class="swiper-slide align-center ' + i + '">' + i + '</div>';
        }
        $(swiper_wrapper).append(template);
    }
    var initialSlideIndex = initialValueInput !== undefined ? parseInt(initialValueInput) : 9;
    if (swiperHour[container] === undefined) {
        swiperHour[container] = new Swiper(container + ' .hour', get_swiper_options(initialSlideIndex));
    } else {
        swiperHour[container].slideTo(initialSlideIndex,0);
    }
}

function minute_scroll(container,initialValueInput) {
    var swiper_wrapper = $(".minute .swiper-wrapper",container);
    if ($(swiper_wrapper).html() === "") {
        var template = "";
        for (var i = 0 ; i < 60 ; i++) {
            template += '<div class="swiper-slide align-center ' + i + '">' + i + '</div>';
        }
        $(swiper_wrapper).append(template);
    }
    var initialSlideIndex = initialValueInput !== undefined ? parseInt(initialValueInput) : 0;
    if (swiperMinute[container] === undefined) {
        swiperMinute[container] = new Swiper(container + ' .minute', get_swiper_options(initialSlideIndex));
    } else {
        swiperMinute[container].slideTo(initialSlideIndex,0);
    }
}

function format_scroll(container,initialValueInput) {
    var swiper_wrapper = $(".format .swiper-wrapper",container);
    if ($(swiper_wrapper).html() === "") {
        var template = '<div class="swiper-slide align-center am">AM</div>' +
                       '<div class="swiper-slide align-center pm">PM</div>';
        $(swiper_wrapper).append(template);
    }
    var initialSlideIndex = initialValueInput !== undefined ? initialValueInput : 0;
    if (swiperFormat[container] === undefined) {
        swiperFormat[container] = new Swiper(container + ' .format', get_swiper_options(initialSlideIndex));
    } else {
        swiperFormat[container].slideTo(initialSlideIndex,0);
    }
}