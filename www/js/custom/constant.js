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
var gender_enum_g = [
    "Male",
    "Female"
];
var smoker_enum_g = [
    "No",
    "Yes"
];
var repeat_mode_g = [
    "REPEAT_MONTHLY",
    "REPEAT_YEARLY",
    "DONT_REPEAT"
];


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
    "DEATH_SUM",
    "TPD_SUM",
    "CRIT_ILL_SUM",
    "EARLY_ILL_SUM",
    "ACCIDENT_LUMP_SUM",
    "ACCIDENT_REIMB",
    "HS_REIMB_SUM",
    "HS_HOSPITAL_CASH",
    "DISABILITY_INCOME",
    "INCOME_PER_MONTH",
    "POLICIES_NUMBER",
    "TOTAL_PREMIUM"
];
var overview_cat_g = [
    "deathSA",
    "tpdSA",
    "critSA",
    "earlySA",
    "accidentDeath", //4
    "accidentReimb",
    "hospitalSA",
    "hospitalIncome",
    "disabledSA", //8
    "currentValue"
];


var doughnut_title_g = [
    "ACCIDENT", // -> accidentDeath(4)
    "BASIC", // -> hospitalSA(6)
    "CRIT", // -> critSA(2)
    "DISABLED", // -> tpdSA(1)
    "DISABLED_INCOME", // -> disabledIncome(8)
    "EARLY", // -> earlySA(3)
    "FAMILY" // -> deathSA(0)
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
var doughnut_cat_g = [
    "accidentDeath",
    "hospitalSA",
    "critSA",
    "tpdSA",
    "disabledIncome",
    "earlySA",
    "deathSA"
];

var overview_to_dougnut_mapping_g = [
    4,
    6,
    2,
    1,
    8,
    3,
    0,
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