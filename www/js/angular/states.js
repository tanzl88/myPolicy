app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        //------------------------ LOGIN ------------------------
        .state('login', {
            url: '/login',
            templateUrl: "login/login.html",
            controller: "LoginCtrl",
        })
        .state('signup', {
            url: '/signup',
            templateUrl: "login/signup.html",
            controller: "SignUpCtrl",
        })
        .state('forgot', {
            url: '/forgot',
            templateUrl: "login/forgot.html",
            controller: "ForgotCtrl",
        })
        .state('resetPassword', {
            url: '/resetPassword',
            templateUrl: "login/resetPassword.html",
            controller: "ResetPasswordCtrl",
        })
        .state('retrieveAccount', {
            url: '/retrieveAccount',
            templateUrl: "login/retrieveAccount.html",
            controller: "RetrieveAccountCtrl",
        })
        .state('retrieveAccountNew', {
            url: '/retrieveAccountNew',
            templateUrl: "login/retrieveAccountNew.html",
            controller: "RetrieveAccountNewCtrl",
        })
        .state('upgradeAccount', {
            url: '/upgradeAccount',
            templateUrl: "login/upgradeAccount.html",
            controller: "UpgradeAccountCtrl",
        })

        //------------------------ TAB ------------------------
        .state('tabs', {
            abstract: true,
            url: '',
            templateUrl: "tabs.html",
        })

        //------------------------ PROFILE ------------------------
        .state('tabs.profile', {
            url: '/profile',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "profile/previewProfile.html",
                    controller: "ProfileCtrl",
                }
            }
        })
        .state('tabs.profile.suggestAmtInput', {
            url: '/caseNotes',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "profile/suggestAmtInput.html",
                    controller: "SuggestAmtInputCtrl",
                }
            }
        })
        .state('tabs.profile.netWorthInput', {
            url: '/caseNotes',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "profile/netWorthInput.html",
                    controller: "netWorthInputCtrl",
                }
            }
        })
        .state('tabs.profile.caseNotes', {
            url: '/caseNotes',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "profile/caseNotes.html",
                    controller: "CaseNotesCtrl",
                }
            }
        })
        .state('tabs.profile.caseNotes.addCaseNotes', {
            url: '/addCaseNotes',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "profile/addCaseNotes.html",
                    controller: "AddCaseNotesCtrl",
                }
            }
        })
        .state('tabs.profile.editProfile', {
            url: '/editProfile',
            views: {
                "profile-tab@tabs": {
                    templateUrl: "profile/editProfile.html",
                    controller: "EditProfileCtrl",
                }
            }
        })

        //------------------------ CLIENT ------------------------
        .state('tabs.home.clients', {
            url: '/clients',
            views: {
                "home-tab@tabs": {
                    templateUrl: "clients/clients.html",
                    controller: "clientsAccountCtrl",
                }
            }
        })
        //.state('tabs.home.clients', {
        //    abstract: true,
        //    url: '/clients',
        //    views: {
        //        "home-tab@tabs": {
        //            templateUrl: "clients/clients-tabs.html"
        //        }
        //    }
        //})
        //.state('tabs.home.clients.linkedClients', {
        //    url: '/linkedClients',
        //    views: {
        //        "linkedClients-tab": {
        //            templateUrl: "clients/linkedClients.html",
        //            controller: "linkedAccountCtrl",
        //        }
        //    }
        //})
        //.state('tabs.home.clients.transferClients', {
        //    url: '/transferClients',
        //    views: {
        //        "transferClients-tab": {
        //            templateUrl: "clients/transferClients.html",
        //            controller: "tempAccountCtrl",
        //        }
        //    }
        //})


        //------------------------ HOME ------------------------
        .state('tabs.home', {
            url: '/home',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/home.html",
                    controller: "HomeCtrl",
                }
            }
        })
        .state('tabs.home.advisorInfo', {
            url: '/advisorInfo',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/advisorInfo.html",
                    controller: "AdvisorInfoCtrl",
                }
            }
        })
        .state('tabs.home.editAdvisorProfile', {
            url: '/editAdvisorProfile',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/editAdvisorProfile.html",
                    controller: "EditAdvisorProfileCtrl",
                }
            }
        })
        .state('tabs.home.createClientAccount', {
            url: '/createClientAccount',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/createClientAccount.html",
                    controller: "CreateClientAccountCtrl",
                }
            }
        })
        .state('tabs.home.reminder', {
            url: '/reminder',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/reminder.html",
                    controller: "ReminderCtrl",
                }
            }
        })
        .state('tabs.home.notification', {
            url: '/notification',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/notification.html",
                    controller: "NotificationCtrl",
                }
            }
        })
        .state('tabs.home.askQuestion', {
            url: '/askQuestion',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/askQuestion.html",
                    controller: "AskQuestionCtrl",
                }
            }
        })
        //------------------------ EXPORT ------------------------
        .state('tabs.home.generateReport', {
            url: '/generateReport',
            views: {
                "home-tab@tabs": {
                    templateUrl: "home/generateReport.html",
                    controller: "GenerateReportCtrl",
                }
            }
        })
        .state('tabs.home.generateReport.export', {
            url: '/export',
            cache: false,
            views: {
                "home-tab@tabs": {
                    templateUrl: "export/export.html",
                    controller: "ExportCtrl",
                }
            }
        })
        //------------------------ SETTINGS ------------------------
        .state('tabs.home.settings', {
            url: '/settings',
            views: {
                "home-tab@tabs": {
                    templateUrl: "settings/settings.html",
                    controller: "SettingsCtrl",
                }
            }
        })
        .state('tabs.home.settings.reportType', {
            url: '/reportType',
            views: {
                "home-tab@tabs": {
                    templateUrl: "settings/reportType.html",
                    controller: "ReportTypeCtrl",
                }
            }
        })
        .state('tabs.home.settings.reportType.editReportType', {
            url: '/editReportType',
            views: {
                "home-tab@tabs": {
                    templateUrl: "settings/editReportType.html",
                    controller: "EditReportTypeCtrl",
                }
            }
        })
        .state('tabs.home.settings.customizeFieldNames', {
            url: '/customizeFieldNames',
            views: {
                "home-tab@tabs": {
                    templateUrl: "settings/customizeFieldNames.html",
                    controller: "CustomizeFieldNamesCtrl",
                }
            }
        })
        .state('tabs.home.settings.changePassword', {
            url: '/changePassword',
            views: {
                "home-tab@tabs": {
                    templateUrl: "settings/changePassword.html",
                    controller: "ChangePasswordCtrl",
                }
            }
        })
        .state('tabs.home.settings.changeEmail', {
            url: '/changeEmail',
            views: {
                "home-tab@tabs": {
                    templateUrl: "settings/changeEmail.html",
                    controller: "ChangeEmailCtrl",
                }
            }
        })


        //------------------------ LIST ------------------------
        .state('tabs.list', {
            url: '/list',
            views: {
                "list-tab@tabs": {
                    templateUrl: "list/list.html",
                    controller: "ListCtrl",
                }
            }
        })
        .state('tabs.list.editPolicy', {
            url: '/editPolicy',
            views: {
                "list-tab@tabs": {
                    templateUrl: "list/addPolicy.html",
                    controller: "AddPolicyCtrl",
                }
            }
        })
        .state('tabs.list.addPolicy', {
            url: '/addPolicy',
            views: {
                "list-tab@tabs": {
                    templateUrl: "list/addPolicy.html",
                    controller: "AddPolicyCtrl",
                }
            }
        })
        .state('tabs.list.gallery', {
            url: '/gallery',
            views: {
                "list-tab@tabs": {
                    templateUrl: "list/gallery.html",
                    controller: "GalleryCtrl",
                }
            }
        })
        //------------------------ REPORTS ------------------------
        .state('tabs.reports', {
            abstract: true,
            url: '/reports',
            views: {
                "reports-tab@tabs": {
                    templateUrl: "report/report-tabs.html",
                    //controller: "OverviewCtrl",
                }
            }
        })
        .state('tabs.reports.overview', {
            url: '/overview',
            views: {
                "overview-tab": {
                    templateUrl: "report/overview.html",
                    controller: "OverviewCtrl",
                }
            }
        })
        .state('tabs.reports.report', {
            url: '/report',
            views: {
                "report-tab": {
                    templateUrl: "report/report.html",
                    controller: "ReportCtrl",
                }
            }
        })
        .state('tabs.reports.premium', {
            url: '/premium',
            views: {
                "premium-tab": {
                    templateUrl: "report/premium.html",
                    controller: "PremiumCtrl",
                }
            }
        })
        .state('tabs.reports.netWorth', {
            url: '/netWorth',
            views: {
                "netWorth-tab": {
                    templateUrl: "report/netWorth.html",
                    controller: "NetWorthCtrl",
                }
            }
        })


        //.state('tabs.overview', {
        //    url: '/overview',
        //    views: {
        //        "overview-tab": {
        //            templateUrl: "overview/overview.html",
        //            controller: "OverviewCtrl",
        //        }
        //    }
        //})

        //.state('tabs.report', {
        //    url: '/report',
        //    views: {
        //        "report-tabtab": {
//                    templateUrl: "report/report.html",
//                    controller: "ReportCtrl",
//                }
//            }
//  ;      })
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});