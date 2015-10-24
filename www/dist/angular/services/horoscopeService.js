app.service('horoscopeService', ['$q', '$http', '$translate', function($q,$http,$translate) {


    return {
        getHoroscope: function (month,day) {
            var zodiacSigns = {
                'capricorn'     : 'capricorn',
                'aquarius'      : 'aquarius',
                'pisces'        : 'pisces',
                'aries'         : 'aries',
                'taurus'        : 'taurus',
                'gemini'        : 'gemini',
                'cancer'        : 'cancer',
                'leo'           : 'leo',
                'virgo'         : 'virgo',
                'libra'         : 'libra',
                'scorpio'       : 'scorpio',
                'sagittarius'   : 'sagittarius'
            };

            if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) {
                var horoscope =  zodiacSigns.capricorn;
            } else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) {
                var horoscope =  zodiacSigns.aquarius;
            } else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
                var horoscope =  zodiacSigns.pisces;
            } else if ((month == 3 && day >= 21) || (month == 4 && day <= 20)) {
                var horoscope =  zodiacSigns.aries;
            } else if ((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
                var horoscope =  zodiacSigns.taurus;
            } else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
                var horoscope =  zodiacSigns.gemini;
            } else if ((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
                var horoscope =  zodiacSigns.cancer;
            } else if ((month == 7 && day >= 23) || (month == 8 && day <= 23)) {
                var horoscope =  zodiacSigns.leo;
            } else if ((month == 8 && day >= 24) || (month == 9 && day <= 23)) {
                var horoscope =  zodiacSigns.virgo;
            } else if ((month == 9 && day >= 24) || (month == 10 && day <= 23)) {
                var horoscope =  zodiacSigns.libra;
            } else if ((month == 10 && day >= 24) || (month == 11 && day <= 22)) {
                var horoscope =  zodiacSigns.scorpio;
            } else if ((month == 11 && day >= 23) || (month == 12 && day <= 21)) {
                var horoscope =  zodiacSigns.sagittarius;
            }

            return "img/horoscope/" + horoscope + ".png";
        },
    }
}]);