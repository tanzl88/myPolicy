app.service('ageIconService', function($q,$http,$translate) {


    return {
        getIcon: function (age,gender) {
            if (age < 5) {
                var age_img = "img/dob_icons/" + gender + "_0.png";
            } else if (age < 10) {
                var age_img = "img/dob_icons/" + gender + "_1.png";
            } else if (age < 15) {
                var age_img = "img/dob_icons/" + gender + "_2.png";
            } else if (age < 20) {
                var age_img = "img/dob_icons/" + gender + "_3.png";
            } else if (age < 25) {
                var age_img = "img/dob_icons/" + gender + "_4.png";
            } else if (age < 35) {
                var age_img = "img/dob_icons/" + gender + "_5.png";
            } else if (age < 55) {
                var age_img = "img/dob_icons/" + gender + "_6.png";
            } else {
                var age_img = "img/dob_icons/" + gender + "_7.png";
            }
            return age_img;
        },
    }
});