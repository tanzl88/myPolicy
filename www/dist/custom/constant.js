// CONSTANT
var window_height_g = $(window).height();
var window_width_g = $(window).width();


// URL
var url = "https://mypolicyapp.com/";
var base_url = url + "app_api/";
var repo_url = url + "repository/";
var ctrl_url = base_url + "index.php/main/";
var register_url = base_url + "index.php/accounts/";


// COLOR
var current_color = "rgba(130,124,111,1)";
var suggested_color = "rgba(254,219,47,1)";
var shortfall_color = "rgba(227,113,93,1)";
var excess_color = "rgba(139,188,230,1)";
var currency_g = "S$ ";
var currency_label_g = "SGD";

// AUTOCOMPLETE ARRAY
var company_enum_g = [
    "AIA",
    "AVIVA",
    "AXA Life",
    "Friends Provident",
    "GE",
    "LIC",
    "Manulife",
    "NTUC Income",
    "OAC",
    "Prudential",
    "Raffles Health Insurance",
    "Standard Life",
    "TM Life",
    "Transamerica",
    "Zurich Int",
    "Zurich Life SG"
];
var plan_type_enum_g = [
    "Whole Life",
    "Term",
    "Endowment",
    "Hospital & Surgical",
    "Investment-Linked",
    "Riders & Sup Benefits",
    "Accidental",
    "Disablity Income",
    "Long Term Care",
    "General",
    "Group",
    "Others"
];
var plan_type_cat_enum_g = [
    "protection",
    "protection",
    "savings",
    "protection",
    "savings",
    "protection",
    "protection",
    "protection",
    "protection",
    "protection",
    "protection",
    "protection"
];
var premium_mode_enum_g = [
    "Single Premium",
    "Half yearly",
    "Quarterly",
    "Monthly",
    "Yearly",
];
var premium_mode_factor_g = [
    0,
    2,
    4,
    12,
    1
];
var payment_mode_enum_g = [
    "GIRO",
    "Cash / Cheque",
    "Credit card",
    "CPF",
    "Others"
];
var reminder_selection_mode_g = [
    "SELECT_SINGLE",
    "SELECT_NOT_SET",
    "SELECT_ALL",
];
var gender_enum_g = [
    "Male",
    "Female"
];
var smoker_enum_g = [
    "No",
    "Yes"
];
var advanced_enum_g = [
    "No",
    "Yes"
];
var differentiate_rate_enum_g = [
    "No",
    "Yes"
];
var repeat_mode_g = [
    "REPEAT_MONTHLY",
    "REPEAT_YEARLY",
    "DONT_REPEAT"
];

//INDEX -> INDEX RECORDED IN REMINDER DATABASE
//ORDER -> ORDER IN SWITCHING AND ARRAY
//POLICY -> INDEX RECORDED FROM IN POLICY DATABASE
var repeat_mode_g = [
    {
        name      : "monthly",
        cordova   : "month",
        translate : "REPEAT_MONTHLY",
        index     : 0,
        order     : 0,
        policy    : 3
    },
    {
        name      : "quarterly",
        cordova   : "quarter",
        translate : "REPEAT_QUARTERLY",
        index     : 3,
        order     : 1,
        policy    : 2
    },
    //{
    //    name      : "semiannually",
    //    cordova   : "semiannual",
    //    translate : "REPEAT_SEMIANNUALLY",
    //    index     : 4,
    //    order     : 2,
    //    policy    : 1
    //},
    {
        name      : "yearly",
        cordova   : "year",
        translate : "REPEAT_YEARLY",
        index     : 1,
        order     : 2,
        policy    : 4
    },
    {
        name      : "no-repeat",
        cordova   : "0",
        translate : "NO_REPEAT",
        index     : 2,
        order     : 3,
        policy    : 0
    }
];
var repeatModeEnum = _.sortBy(repeat_mode_g,function(obj){
    return obj.order;
});


// OTHER ENUMS
var months_enum_g = [
    "Christmas",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

var overview_title_g = [
    {
        name : "DEATH_SUM",
        type : "currency",
        col  : "deathSA",
        chart: "lump"
    },
    {
        name : "TPD_SUM",
        type : "currency",
        col  : "tpdSA",
        chart: "lump"
    },
    {
        name : "CRIT_ILL_SUM",
        type : "currency",
        col  : "critSA",
        chart: "lump"
    },
    {
        name : "EARLY_ILL_SUM",
        type : "currency",
        col  : "earlySA",
        chart: "lump"
    },
    {
        name : "TERMINAL_ILL_SUM",
        type : "currency",
        col  : "terminalSA",
        chart: "lump"
    },
    {
        name : "ACCIDENT_LUMP_SUM",
        type : "currency",
        col  : "accidentDeath",
        chart: "lump"
    },
    {
        name : "ACCIDENT_REIMB",
        type : "currency",
        col  : "accidentReimb",
        chart: "income"
    },
    {
        name : "HS_REIMB_SUM",
        type : "currency",
        col  : "hospitalSA",
        chart: "lump"
    },
    {
        name : "HS_HOSPITAL_CASH",
        type : "currency",
        col  : "hospitalIncome",
        chart: "income"
    },
    {
        name : "DISABILITY_INCOME",
        type : "currency",
        col  : "disabledSA",
        chart: "income"
    },
    {
        name : "INCOME_PER_MONTH",
        type : "currency",
        col  : "retireIncome",
        chart: "income"
    },
    {
        name : "CASH_VALUE",
        type : "currency",
        col  : "currentValue",
        chart: "value"
    },
    {
        name : "SURRENDER_CASH_VALUE",
        type : "currency",
        col  : "surrenderValue",
        chart: "value"
    }
];

var overview_income_title_g = [
    {
        name : "ACCIDENT_REIMB",
        type : "currency",
        col  : "accidentReimb"
    },
    {
        name : "HS_HOSPITAL_CASH",
        type : "currency",
        col  : "hospitalIncome"
    },
    {
        name : "DISABILITY_INCOME",
        type : "currency",
        col  : "disabledSA"
    },
    {
        name : "INCOME_PER_MONTH",
        type : "currency",
        col  : "retireIncome"
    },
    {
        name : "CASH_VALUE",
        type : "currency",
        col  : "currentValue"
    },
    {
        name : "SURRENDER_CASH_VALUE",
        type : "currency",
        col  : "surrenderValue"
    }
];


var premium_title_g = [
    {
        name : "TOTAL_PREMIUM",
        type : "currency"
    },
    {
        name : "PREMIUM_TO_INCOME_RATIO",
        type : "number"
    },
    {
        name : "PROTECTION_PREMIUM_TO_INCOME_RATIO",
        type : "number"
    },
    {
        name : "SAVINGS_PREMIUM_TO_INCOME_RATIO",
        type : "number"
    }
]


var doughnut_title_g = [
    {
        name    : "ACCIDENT",
        col     : "accidentDeath"
    },
    {
        name    : "BASIC",
        col     : "hospitalSA"
    },
    {
        name    : "CRIT",
        col     : "critSA"
    },
    {
        name    : "DISABLED",
        col     : "tpdSA"
    },
    {
        name    : "DISABLED_INCOME",
        col     : "disabledSA"
    },
    {
        name    : "EARLY",
        col     : "earlySA"
    },
    {
        name    : "FAMILY",
        col     : "deathSA"
    }
];
var score_weight_g = [
    1,
    1,
    1,
    1,
    12,
    1,
    1
];
var income_factor_g = [
    2,
    5,
    5,
    10,
    3 / 4 / 12,
    2,
    10
];
var exps_factor_g = [
    4,
    10,
    10,
    20,
    1 / 12,
    4,
    20
];

var countdown_array_g = [0,1,3,5,15,30];

var reminder_display_g = [
    {
        name    : "SHOW_ALL",
        filter  : {}
    },
    {
        name    : "SHOW_BIRTHDAY",
        filter  : {type : 'birthday'}
    },
    {
        name    : "SHOW_REVIEW",
        filter  : {type : 'review'}
    },
    {
        name    : "SHOW_MATURITY",
        filter  : {type : 'maturity'}
    },
    {
        name    : "SHOW_PAYMENT",
        filter  : {type : 'payment'}
    }
];
var reminder_sort_g = [
    {
        name    : "SORT_COUNTDOWN",
        sortCol : "countdown"
    },
    {
        name    : "SORT_NAME",
        sortCol : "name"
    }
];


var assets_g = [
    {
        title   : "CASH",
        varName : "cashAssets"
    },
    {
        title   : "PENSION",
        varName : "pension"
    },
    {
        title   : "INVESTMENTS",
        varName : "investmentAssets"
    },
    {
        title   : "HOUSE",
        varName : "houseValue"
    },
    {
        title   : "CAR",
        varName : "carValue"
    },
    {
        title   : "OTHERS",
        varName : "otherAssets"
    }
];
var liabilities_g = [
    {
        title   : "MORTGAGE",
        varName : "mortgage"
    },
    {
        title   : "AUTO_LOANS",
        varName : "autoLoans"
    },
    {
        title   : "STUDY_LOANS",
        varName : "studyLoans"
    },
    {
        title   : "OTHERS",
        varName : "otherLiabilities"
    }
];
var financial_ratio_g = [
    {
        title : "LIQUIDITY_RATIO",
        numerator   : "cashAssets",
        denominator : "expenditure",
        lower       : 3,
        upper       : 6
    },
    {
        title : "SOLVENCY_RATIO",
        numerator   : "netWorth",
        denominator : "totalAssets",
        lower       : 50
    },
    {
        title : "DEBT_TO_ASSET_RATIO",
        numerator   : "totalLiabilities",
        denominator : "totalAssets",
        upper       : 50
    },
    {
        title : "DEBT_SERVICE_RATIO",
        numerator   : "debtRepayment",
        denominator : "cashInflow",
        upper       : 35
    },
    {
        title : "LIQUIDITY_ASSET_TO_NET_WORTH_RATIO",
        numerator   : "cashAssets",
        denominator : "netWorth",
        lower       : 15,
        upper       : 20
    },
    {
        title : "NET_INVESTMENT_ASSETS_TO_NET_WORTH_RATIO",
        numerator   : "investmentAssets",
        denominator : "netWorth",
        lower       : 50
    },
    {
        title : "SAVINGS_RATIO",
        numerator   : "savings",
        denominator : "cashInflow",
        lower       : 10
    }
];