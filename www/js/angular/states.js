app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        //------------------------ LOGIN ------------------------
        .state('login', {
            url: '/login',
            templateUrl: "templates/login/login.html",
            controller: "LoginCtrl",
        })
        .state('signup', {
            url: '/signup',
            templateUrl: "templates/login/signup.html",
            controller: "SignUpCtrl",
        })
        .state('forgot', {
            url: '/forgot',
            templateUrl: "templates/login/forgot.html",
            controller: "ForgotCtrl",
        })
        .state('resetPassword', {
            url: '/resetPassword',
            templateUrl: "templates/login/resetPassword.html",
            controller: "ResetPasswordCtrl",
        })
        .state('retrieveAccount', {
            url: '/retrieveAccount',
            templateUrl: "templates/login/retrieveAccount.html",
            controller: "RetrieveAccountCtrl",
        })

        //------------------------ TAB ------------------------
        .state('tabs', {
            abstract: true,
            url: '',
            templateUrl: "templates/tabs.html",
        })

        //------------------------ PROFILE ------------------------
        .state('tabs.profile', {
            url: '/profile',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "templates/profile/previewProfile.html",
                    controller: "ProfileCtrl",
                }
            }
        })
        .state('tabs.profile.caseNotes', {
            url: '/caseNotes',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "templates/profile/caseNotes.html",
                    controller: "CaseNotesCtrl",
                }
            }
        })
        .state('tabs.profile.caseNotes.addCaseNotes', {
            url: '/addCaseNotes',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "templates/profile/addCaseNotes.html",
                    controller: "AddCaseNotesCtrl",
                }
            }
        })
        .state('tabs.profile.editProfile', {
            url: '/editProfile',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "templates/profile/editProfile.html",
                    controller: "EditProfileCtrl",
                }
            }
        })

        //------------------------ HOME ------------------------
        .state('tabs.home', {
            url: '/home',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/home.html",
                    controller: "HomeCtrl",
                }
            }
        })
        .state('tabs.home.editAdvisorProfile', {
            url: '/editAdvisorProfile',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/editAdvisorProfile.html",
                    controller: "EditAdvisorProfileCtrl",
                }
            }
        })
        .state('tabs.home.createClientAccount', {
            url: '/createClientAccount',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/createClientAccount.html",
                    controller: "CreateClientAccountCtrl",
                }
            }
        })
        .state('tabs.home.birthday', {
            url: '/birthday',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/birthday.html",
                    controller: "BirthdayCtrl",
                }
            }
        })
        .state('tabs.home.notification', {
            url: '/notification',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/notification.html",
                    controller: "NotificationCtrl",
                }
            }
        })
        .state('tabs.home.advisorInfo', {
            url: '/advisorInfo',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/advisorInfo.html",
                    controller: "AdvisorInfoCtrl",
                }
            }
        })
        .state('tabs.home.generateReport', {
            url: '/generateReport',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/generateReport.html",
                    controller: "GenerateReportCtrl",
                }
            }
        })
        .state('tabs.home.generateReport.export', {
            url: '/export',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/export/export.html",
                    controller: "ExportCtrl",
                }
            }
        })

        .state('tabs.home.settings', {
            url: '/settings',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/settings.html",
                    controller: "SettingsCtrl",
                }
            }
        })
        .state('tabs.home.settings.customizeFieldNames', {
            url: '/customizeFieldNames',
            views: {
                "home-tab@tabs": {
                    templateUrl: "templates/home/customizeFieldNames.html",
                    controller: "CustomizeFieldNamesCtrl",
                }
            }
        })


        //------------------------ LIST ------------------------
        .state('tabs.list', {
            url: '/list',
            views: {
                "list-tab@tabs": {
                    templateUrl: "templates/list/list.html",
                    controller: "ListCtrl",
                }
            }
        })
        .state('tabs.list.editPolicy', {
            url: '/editPolicy',
            views: {
                "list-tab@tabs": {
                    templateUrl: "templates/list/addPolicy.html",
                    controller: "AddPolicyCtrl",
                }
            }
        })
        .state('tabs.list.addPolicy', {
            url: '/addPolicy',
            views: {
                "list-tab@tabs": {
                    templateUrl: "templates/list/addPolicy.html",
                    controller: "AddPolicyCtrl",
                }
            }
        })
        .state('tabs.list.gallery', {
            url: '/gallery',
            views: {
                "list-tab@tabs": {
                    templateUrl: "templates/list/gallery.html",
                    controller: "GalleryCtrl",
                }
            }
        })

        .state('tabs.overview', {
            url: '/overview',
            views: {
                "overview-tab@tabs": {
                    templateUrl: "templates/overview/overview.html",
                    controller: "OverviewCtrl",
                }
            }
        })

        .state('tabs.report', {
            url: '/report',
            views: {
                "report-tab@tabs": {
                    templateUrl: "templates/report/report.html",
                    controller: "ReportCtrl",
                }
            }
        })

        .state('tabs.export', {
            url: '/export',
            views: {
                "report-tab@tabs": {
                    templateUrl: "templates/export/export.html",
                    controller: "ExportCtrl",
                }
            }
        })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});