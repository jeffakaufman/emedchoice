/**
 * Created by aleksey on 10/04/14.
 */

"use strict";
angular.module("emedchoiceApp", ["ngCookies", "ngResource", "ngSanitize", "leaflet-directive", "ui.bootstrap", "angularFileUpload", "ngTable"]).config(["$routeProvider",
        function ($routeProvider) {
            $routeProvider.when("/", {
                templateUrl: "views/main.html",
                controller: "MainCtrl"
            }).when("/providers", {
                templateUrl: "views/facilities.html",
                controller: "FacilitiesCtrl"
            }).when("/provider/:provider", {
                templateUrl: "views/details-facility.html",
                controller: "FacilitydetailsCtrl"
            }).when("/placements", {
                templateUrl: "views/placements.html",
                controller: "PlacementsCtrl"
            }).when("/choices", {
                templateUrl: "views/choices.html",
                controller: "ChoicesCtrl"
            }).when("/patientletter", {
                templateUrl: "views/patientletter.html",
                controller: "PatientletterCtrl"
            }).when("/providermanager", {
                templateUrl: "views/facilitymanager.html",
                controller: "FacilitymanagerCtrl"
            }).when("/editprovider/:provider", {
                templateUrl: "views/editfacility.html",
                controller: "EditfacilityCtrl"
            }).when("/watchlist", {
                templateUrl: "views/watchlist.html",
                controller: "WatchlistCtrl"
            }).when("/performance/:provider", {
                templateUrl: "views/history.html",
                controller: "HistoryCtrl"
            }).when("/referrals", {
                templateUrl: "views/referrals.html",
                controller: "ReferralsCtrl"
            }).when("/review/:token", {
                templateUrl: "views/review.html",
                controller: "ReviewCtrl"
            }).when("/login", {
                templateUrl: "views/login.html",
                controller: "LoginCtrl"
            }).when("/logout", {
                templateUrl: "views/logout.html",
                controller: "LogoutCtrl"
            }).when("/incompatible", {
                templateUrl: "views/incompatible.html",
                controller: "IncompatibleCtrl"
            }).when("/account", {
                templateUrl: "views/account.html",
                controller: "AccountCtrl"
            }).otherwise({
                redirectTo: "/"
            })
        }
    ]).run(["$rootScope", "$location", "Dataservice",
        function ($rootScope, $location, Dataservice) {
            $rootScope.$on("$routeChangeStart", function () {
                if ("undefined" != typeof Storage) {
                    $rootScope.user = Dataservice.get("user");
                    var d = $location.url(),
                        e = String(d).match(/provider\//);
//                    $rootScope.user.id && $rootScope.user.token || ($location.url(e ? d : "/login"), $rootScope.user = {})
                } else {
                    $location.url("/incompatible")
                }
            });

            $rootScope.$on("$routeChangeSuccess", function () {
                $rootScope.location = $location
            })
        }
    ]);

NProgress.configure({
    minimum: .25,
    ease: "ease",
    speed: 500
});

toastr.options = {
    closeButton: !1,
    debug: !1,
    positionClass: "toast-bottom-left",
    onclick: null
};

Highcharts.Data.prototype.dateFormats["m/d/Y"] = {
    regex: "^([0-9]{1,2})/([0-9]{1,2})/([0-9]{2})$",
    parser: function (a) {
        return Date.UTC(+("20" + a[3]), a[1] - 1, +a[2])
    }
};

$(".infotip").popover({
    trigger: "hover"
});

$(function () {
    $("body").on("keyup", ".field-phone", function () {
        var a = this.selectionStart,
            b = /[^0-9]/gi,
            c = $(this).val();
        b.test(c) && ($(this).val(c.replace(b, "")), a--), this.setSelectionRange(a, a)
    })
});

angular.module("emedchoiceApp").controller("MainCtrl", ["$scope", "$rootScope", "Api", "Search", "Dataservice",
    function ($scope, $rootScope, Api, Search, Dataservice) {
        $rootScope.search = Dataservice.get("search"), $rootScope.search.provider || ($rootScope.search = Search.get()), $rootScope.vars = {
            homepage: !0
        }, $rootScope.isCollapsed = !0, $scope.today = function () {
            $rootScope.dt = new Date
        }, $scope.today(), $scope.showWeeks = !0, $rootScope.toggleWeeks = function () {
            $scope.showWeeks = !$scope.showWeeks
        }, $rootScope.clear = function () {
            $rootScope.dt = null
        }, $rootScope.disabled = function (a, b) {
            return "day" === b && (0 === a.getDay() || 6 === a.getDay())
        }, $rootScope.toggleMin = function () {
            $rootScope.minDate = $rootScope.minDate ? null : new Date
        }, $rootScope.toggleMin(), $rootScope.open = function (a) {
            a.preventDefault(), a.stopPropagation(), $rootScope.opened = !0
        }, $rootScope.dateOptions = {
            "year-format": "'yy'",
            "starting-day": 1
        }, $rootScope.formats = ["dd-MMMM-yyyy", "yyyy-MM-dd", "shortDate"], $rootScope.format = $scope.formats[1], Api.listing_limit("facilities", 10).then(function (b) {
            $scope.facilities = b.data.data
        }), Api.get_service_groups().then(function (a) {
            $rootScope.service_groups = a.data.data
        }), Api.get_services($rootScope.search).then(function (a) {
            $rootScope.services = a.data.data
        }), Api.listing("insurances").then(function (a) {
            $rootScope.insurances = a.data.data
        }), Api.listing("diagnosis").then(function (a) {
            $rootScope.diagnosis = a.data.data
        }), Api.listing("program_types").then(function (a) {
            $rootScope.program_types = a.data.data
        }), $rootScope.$watch("search.service_group", function () {
            Api.get_services($rootScope.search).then(function (a) {
                $rootScope.services = a.data.data, $rootScope.search.service = $rootScope.services[0].id
            })
        }, !0), $rootScope.$watch("search.service", function (a) {
            $rootScope.search.services = [], $rootScope.search.services[parseInt(a)] = !0
        }, !0), $rootScope.$watch("search", function () {
            Dataservice.set("search", $rootScope.search)
        }, !0)
    }
]);

angular.module("emedchoiceApp").service("Api", ["$http",
    function ($http) {
        var apiPath = "http://localhost/emedchoice/",
            getBehavior = function (reqUri) {
                var request = $http.get(apiPath + reqUri).success(function (response) {
                    return response;
                });
                return request;
            }, postBehavior = function (reqUri, postData) {
                var request = $http({
                    method: "POST",
                    url: apiPath + reqUri,
                    data: postData,
                    headers: {
                        "Access-Control-Allow-Origin": !0,
                        "Content-Type": "application/json"
                    }
                }).success(function (response) {
                    return response;
                });
                return request;
            };

        return {
            get_listing: function (a) {
                return postBehavior("get_listing/", a)
            },
            get_records: function (a) {
                return postBehavior("get_records/", a)
            },
            get_facility: function (a) {
                return postBehavior("get_facility/", a)
            },
            get_facilities: function (a) {
                return postBehavior("get_facilities/", a)
            },
            get_services: function (a) {
                return postBehavior("get_services", a)
            },
            get_all_services: function () {
                return getBehavior("get_all_services")
            },
            get_placements: function () {
                return getBehavior("get_placements")
            },
            listing: function (a) {
                return getBehavior("listing/" + a)
            },
            listing_limit: function (a, b) {
                return getBehavior("listing/" + a + "/" + b)
            },
            load_facilities: function () {
                return getBehavior("load_facilities")
            },
            send_letter: function (a) {
                return postBehavior("send_letter/", a)
            },
            add_service: function (a) {
                return postBehavior("add_service", a)
            },
            remove_service: function (a) {
                return postBehavior("remove_service", a)
            },
            add_provider: function (a) {
                return postBehavior("add_provider", a)
            },
            add_user: function (a) {
                return postBehavior("add_user", a)
            },
            remove_user: function (a) {
                return postBehavior("remove_user", a)
            },
            save_facility: function (a) {
                return postBehavior("save_facility", a)
            },
            remove_provider: function (a) {
                return postBehavior("remove_provider", a)
            },
            remove_facility: function (a) {
                return postBehavior("remove_facility", a)
            },
            create_facility: function (a) {
                return postBehavior("create_facility", a)
            },
            create_service: function (a) {
                return postBehavior("create_service", a)
            },
            create_provider: function (a) {
                return postBehavior("create_provider", a)
            },
            watch_item: function (a) {
                return postBehavior("watch_item", a)
            },
            get_watchlist: function (a) {
                return postBehavior("get_watchlist", a)
            },
            watch_item_drop: function (a) {
                return postBehavior("watch_item_drop", a)
            },
            get_referrals: function (a) {
                return postBehavior("get_referrals", a)
            },
            remove_watchlist_item: function (a) {
                return postBehavior("remove_watchlist_item", a)
            },
            get_history: function (a) {
                return postBehavior("get_history", a)
            },
            report_avgcloseouttime: function (a) {
                return postBehavior("report_avgcloseouttime", a)
            },
            report_referralsaccepted: function (a) {
                return postBehavior("report_referralsaccepted", a)
            },
            report_referralsdeferred: function (a) {
                return postBehavior("report_referralsdeferred", a)
            },
            report_hits: function (a) {
                return postBehavior("report_hits", a)
            },
            report_conversions: function (a) {
                return postBehavior("report_conversions", a)
            },
            report_totalsearches: function (a) {
                return postBehavior("report_totalsearches", a)
            },
            report_monthlyreferrals: function (a) {
                return postBehavior("report_monthlyreferrals", a)
            },
            report_qos: function (a) {
                return postBehavior("report_qos", a)
            },
            report_bedsfilled: function (a) {
                return postBehavior("report_bedsfilled", a)
            },
            validate_token: function (a) {
                return postBehavior("validate_token", a)
            },
            login_user: function (a) {
                return postBehavior("login_user", a)
            },
            validate_session: function (a) {
                return postBehavior("validate_session", a)
            },
            get_affiliates: function (a) {
                return postBehavior("get_affiliates", a)
            },
            get_cm_performace: function (a) {
                return postBehavior("get_cm_performace", a)
            },
            process_review: function (a) {
                return postBehavior("process_review", a)
            },
            get_latlon: function (a) {
                return postBehavior("get_latlon", a)
            },
            save_profile: function (a) {
                return postBehavior("save_profile", a)
            },
            add_staff: function (a) {
                return postBehavior("add_staff", a)
            },
            get_service_groups: function () {
                return getBehavior("get_service_groups")
            },
            url: function () {
                return apiPath
            }
        }
    }
]);

angular.module("emedchoiceApp").service("Search", function () {
    var searchParams = {
        location: {
            context: "facilities",
            city: "San Antonio",
            state: "Texas",
            zip: "78258",
            distance: "5",
            coords: {
                lat: 29.4551018,
                lng: -98.4980617
            }
        },
        provider: "1",
        when: "Nov. 14th, 2013",
        anticipated_discharge_date: "Nov. 14th, 2013",
        beds: "",
        service: "1",
        service_group: "6",
        program_type: "Adult Day Care",
        diagnosis: "1",
        staff: "",
        do_proximity_search: !0,
        services: {}
    }, b = function (b) {
        return searchParams = b
    };
    return {
        set: function (a) {
            return b(a)
        },
        get: function () {
            return searchParams
        }
    }
});

angular.module("emedchoiceApp").filter("slugify", function () {
    return function (a) {
        return String(a).toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
    }
});

angular.module("emedchoiceApp").filter("lower", function () {
    return function (a) {
        return new String(a).toLowerCase()
    }
});

angular.module("emedchoiceApp").filter("slice", function () {
    return function (a, b, c) {
        return a.slice(b, c)
    }
});

angular.module("emedchoiceApp").controller("FacilitiesCtrl", ["$scope", "$http", "Api", "Search", "$rootScope", "Dataservice",
    function ($scope, $http, Api, Search, $rootScope, Dataservice) {
        $scope.filtered_facilities = [], $scope.currentPage = 1, $scope.numPerPage = 10, $scope.maxSize = 5, $scope.pageCount = 0, $scope.search = Dataservice.get("search"), $scope.search.provider || ($scope.search = Search.get()), $scope.choices = Dataservice.get("choices", !0), $scope.test_name = "choices", $scope.showPcl = function () {
            $rootScope.show_pcl = !0
        }, angular.extend($scope, {
            center: {
                lat: 29.4167,
                lng: 98.5,
                zoom: 20
            },
            defaults: {
                scrollWheelZoom: !1
            }
        }), $scope.init = function () {
            Modernizr.geolocation && (navigator.geolocation.getCurrentPosition(g), $scope.loadZip())
        };
        var g = function (b) {
            $scope.search.coords = b.coords, $scope.center.lat = $scope.search.coords.latitude, $scope.center.lng = $scope.search.coords.longitude
        };
        $scope.update_main_table = function () {
            $scope.numPages = function () {
                return Math.ceil($scope.facilities.length / $scope.numPerPage)
            }, $scope.pageCount = $scope.facilities.length, $scope.$watch("currentPage + numPerPage", function () {
                var b = ($scope.currentPage - 1) * $scope.numPerPage,
                    c = b + $scope.numPerPage;
                $scope.filtered_facilities = $scope.facilities.slice(b, c)
            })
        }, Api.get_facilities($scope.search).then(function (b) {
            $scope.facilities = b.data.data, $scope.update_main_table($scope.facilities)
        }), Api.get_service_groups().then(function (a) {
            $rootScope.service_groups = a.data.data
        }), Api.get_services($scope.search).then(function (b) {
            $scope.services = b.data.data
        }), Api.listing("insurances").then(function (b) {
            $scope.insurances = b.data.data
        }), Api.listing("program_types").then(function (b) {
            $scope.program_types = b.data.data
        }), $scope.onUpdateZip = function () {
            NProgress.start(), $("#img-search-loader").show(), Search.set($scope.search), Dataservice.set("search", Search.get()), Api.get_facilities($scope.search).then(function (b) {
                $scope.facilities = b.data.data, $scope.loadZip(), $scope.update_main_table($scope.facilities), $("#img-search-loader").hide(), NProgress.done()
            })
        }, $scope.onViewMap = function (b) {
            $("#modal-map").modal("show"), $scope.facility = b, $scope.search.coords.lat = parseFloat($scope.facility.lat), $scope.search.coords.lng = parseFloat($scope.facility.lng), $scope.center.lat = $scope.search.coords.latitude, $scope.center.lng = $scope.search.coords.longitude
        }, $scope.addToChoices = function (b, c) {
            var d = b.target;
            if (d.checked) $scope.choices.push(c);
            else {
                var g = $scope.choices.indexOf(c);
                g > -1 && $scope.choices.splice(g, 1)
            }
            Dataservice.set("choices", $scope.choices), $rootScope.pcl_count = $scope.choices.length
        }, $scope.inArray = function (b, c) {
            var d = $scope[c],
                e = !1;
            return $.each(d, function (a, c) {
                c.id === b && (e = !0)
            }), e
        }, $scope.loadZip = function () {
            Api.get_latlon($scope.search).then(function (b) {
                var c = b.data.data;
                $scope.center.lat = parseFloat(c.latitude), $scope.center.lng = parseFloat(c.longitude)
            })
        }, $scope.$watch("search.service_group", function () {
            $scope.search.services = [], Api.get_services($scope.search).then(function (b) {
                $scope.services = b.data.data
            })
        }, !0), $scope.onToggleService = function (b, c) {
            var d = b.target;
            if (d.checked) null !== c.id && "object" == typeof c && $scope.search.services.push(c);
            else {
                var e = $scope.search.services.indexOf(c);
                e > -1 && $scope.search.services.splice(e, 1)
            }
        }
    }
]);

angular.module("emedchoiceApp").controller("FacilitydetailsCtrl", ["$scope", "$http", "Api", "$routeParams", "Dataservice", "$rootScope",
    function ($scope, $http, Api, $routeParams, Dataservice) {
        $scope.choices = Dataservice.get("choices", !0), $scope.user = Dataservice.get("user"), $("span.print").printPage(), $scope.staff_all = {
            title: "!Affiliated Physician"
        }, $scope.staff_doc = {
            title: "Affiliated Physician"
        }, $scope.current_image = "http://placehold.it/468x312", $scope.add_placement = function (b) {
            var c = parseInt(b),
                d = $scope.choices.indexOf(c); - 1 === d ? ($scope.choices.push(c), Dataservice.set("choices", $scope.choices), toastr.success("Provider added to choices list")) : toastr.error("Provider is already in your choices list")
        }, angular.extend($scope, {
            center: {
                lat: 29.55696,
                lng: -98.66529,
                zoom: 25
            },
            markers: {
                center: {
                    lat: 29.55696,
                    lng: -98.66529,
                    focus: !0,
                    draggable: !1
                }
            },
            defaults: {
                scrollWheelZoom: !1
            }
        }), $scope.watch_item = function (b) {
            var d = {
                users_id: $scope.user.id,
                facilities_id: b
            };
            Api.watch_item(d).then(function (a) {
                var b = a.data;
                b.error ? toastr.error(b.title) : toastr.success("Provider added to your watchlist")
            })
        }, $scope.print_provider = function () {}, $scope.change_image = function (b) {
            $scope.current_image = b
        }, $scope.init = function () {
            Api.get_facility($routeParams).then(function (b) {
                $scope.facility = b.data.data, $scope.current_image = $scope.facility.image_main;
                var c = {
                    lat: parseFloat($scope.facility.lat),
                    lng: parseFloat($scope.facility.lng)
                };
                $scope.center.lat = c.lat, $scope.center.lng = c.lng, $scope.markers.center.lat = c.lat, $scope.markers.center.lng = c.lng
            })
        }
    }
]);

angular.module("emedchoiceApp").controller("PlacementsCtrl", ["$scope", "$http", "Api", "Search",
    function ($scope, $http, Api) {
        Api.get_placements().then(function (b) {
            $scope.placements = b.data.data
        }), $scope.init = function () {}
    }
]);

angular.module("emedchoiceApp").service("Dataservice", [
    function () {
        var testArray = [1, 2, 3],
            isLocalStorageExists = function () {
                return Modernizr.localstorage ? !0 : !1
            }, getBehavior = function (a, c, e) {
                var f = [],
                    g = "undefined" != typeof c ? c : !1,
                    h = "undefined" != typeof e ? e : !1;
                if (isLocalStorageExists()) {
                    var i = localStorage.getItem(a);
                    i ? f = JSON.parse(i) : g && (h ? setBehavior(a, h) : setBehavior(a, []))
                }
                return f
            }, setBehavior = function (key, value) {
                return JSON.stringify(value), isLocalStorageExists() ? (localStorage.setItem(key, JSON.stringify(value)), !0) : !1
            }, nukeBehavior = function () {
                return isLocalStorageExists() ? (localStorage.clear(), !0) : !1
            }, pushBehavior = function (key, value) {
                var e = [];
                if (isLocalStorageExists()) {
                    var f = JSON.parse(localStorage.getItem(key));
                    f && (f.push(value), setBehavior(key, f))
                }
                return e
            };
        return {
            get: function (a, b, d) {
                return getBehavior(a, b, d)
            },
            set: function (a, b) {
                setBehavior(a, b)
            },
            push: function (a, b) {
                pushBehavior(a, b)
            },
            trash: function (a) {
                _cut(a)
            },
            nuke: function () {
                nukeBehavior()
            },
            test: function () {
                return testArray
            }
        }
    }
]);

angular.module("emedchoiceApp").controller("ChoicesCtrl", ["$scope", "$rootScope", "Dataservice", "Api",
    function ($scope, $rootScope, Dataservice, Api) {
        $scope.choices = Dataservice.get("choices"), $scope.init = function () {
            Api.get_records({
                table: "facilities",
                records: $scope.choices
            }).then(function (b) {
                $scope.facilities = b.data.data
            })
        }, $scope.on_remove = function (b) {
            var d = $.inArray(parseInt(b), $scope.choices);
            d > -1 && ($scope.choices.splice(d, 1), Dataservice.set("choices", $scope.choices)), $scope.init()
        }
    }
]);

angular.module("emedchoiceApp").directive("cbchoices", ["Dataservice",
    function (Dataservice) {
        return {
            restrict: "E",
            template: '\n            <div class=""> \n                <label class="cb-choices"> \n                <input type="checkbox" class="cb-choice"/> \n                <span class="thinna">Include</span> \n                </label> \n            </div>',
            link: function (b, c, d) {
                b.$watch(d, function () {
                    var b = JSON.parse(d.choice);
                    angular.forEach(Dataservice.get("choices"), function (a) {
                        a === b && ($("label", c).css({
                            color: "green",
                            "font-weight": "normal"
                        }), $("input", c).attr("checked", "checked"))
                    })
                }), $("input", c).bind("click", function (b) {
                    var e = JSON.parse(d.choice),
                        f = b.target;
                    if (f.checked) Dataservice.push("choices", parseInt($.trim(e))), $("label", c).css({
                        color: "green",
                        "font-weight": "normal"
                    });
                    else {
                        var g = [];
                        angular.forEach(Dataservice.get("choices"), function (a) {
                            a !== e && g.push(parseInt(a))
                        }, g), Dataservice.set("choices", g), $("label", c).css({
                            color: "inherit",
                            "font-weight": "normal"
                        })
                    }
                    console.log(Dataservice.get("choices"))
                })
            }
        }
    }
]);

angular.module("emedchoiceApp").controller("PatientletterCtrl", ["$scope", "$timeout", "Dataservice", "Api",
    function ($scope, $timeout, Dataservice, Api) {
        $scope.choices = Dataservice.get("choices"), $scope.search = Dataservice.get("search"), $scope.user = Dataservice.get("user"), $scope.checkModel = {
            left: !1,
            middle: !0,
            right: !1
        }, $scope.letter = {
            date_created: moment().format("MMMM Do YYYY, h:mm:ss a"),
            facility: "Methodist South Hospital",
            address: "1234 Main St, San Antonio, TX 78260",
            patient: "Jane Smith",
            email: "",
            bed_type: "3",
            mot: "Personal"
        }, $scope.init = function () {
            Api.get_records({
                table: "facilities",
                records: $scope.choices
            }).then(function (b) {
                $scope.facilities = b.data.data
            })
        }, $scope.awesomeThings = ["HTML5 Boilerplate", "AngularJS", "Karma"], Api.listing("insurances").then(function (b) {
            $scope.insurances = b.data.data
        }), $scope.sendChoiceLetter = function () {
            NProgress.start(), $scope.processing = !0;
            var b = {
                users_id: $scope.user.id,
                search: $scope.search,
                choices: $scope.choices,
                letter: $scope.letter,
                html: $("#letter-body").html()
            };
            Api.send_letter(b).then(function (b) {
                $scope.processing = !1, NProgress.done(), console.log(b.data.data), $scope.status = b.data.data, $("#modal-letter-status").modal("show")
            })
        }
    }
]);

angular.module("emedchoiceApp").controller("FacilitymanagerCtrl", ["$scope", "$location", "Api", "Dataservice", "ngTableParams",
    function ($scope, $location, Api, Dataservice, ngTableParams) {
        $scope.facilities = [], $scope.selected_facility = {};
        var f = [];
        Api.load_facilities().then(function (b) {
            $scope.facilities = b.data.data, f = $scope.facilities, $scope.tableParams = new ngTableParams({
                page: 1,
                count: 10
            }, {
                total: f.length,
                getData: function (a, b) {
                    a.resolve(f.slice((b.page() - 1) * b.count(), b.page() * b.count()))
                }
            })
        }), $scope.create_facility_pre = function () {
            $scope.selected_facility = {}, $("#modal-add-facility").modal("show")
        }, $scope.create_facility = function () {
            var b = $scope.selected_facility;
            Api.create_facility(b).then(function (b) {
                $scope.selected_facility = b.data.data, $("#modal-add-facility").modal("hide"), toastr.success("facility created successfully"), Api.load_facilities().then(function (b) {
                    $scope.facilities = b.data.data
                })
            })
        }, $scope.remove_facility_pre = function (b) {
            $scope.selected_facility = b, $("#modal-remove-facility").modal("show")
        }, $scope.remove_facility = function () {
            var b = $scope.selected_facility;
            Api.remove_facility(b).then(function () {
                $("#modal-remove-facility").modal("hide"), toastr.warning("facility removed successfully"), Api.load_facilities().then(function (b) {
                    $scope.facilities = b.data.data
                })
            })
        }, $scope.init = function () {}
    }
]);

angular.module("emedchoiceApp").controller("EditfacilityCtrl", ["$scope", "$upload", "$routeParams", "Api", "Dataservice",
    function ($scope, $upload, $routeParams, Api) {
        Api.get_all_services().then(function (b) {
            $scope.services = b.data.data
        }), $scope.onFileSelect = function (c, e) {
            if ($scope.selectedFiles = [], $scope.progress = [], $scope.upload && $scope.upload.length > 0)
                for (var f = 0; f < $scope.upload.length; f++) null !== $scope.upload[f] && $scope.upload[f].abort();
            $scope.upload = [], $scope.selectedFiles = c;
            for (var f = 0; f < c.length; f++) {
                var g = c[f];
                $scope.progress[f] = 0,
                    function (c) {
                        $scope.upload[c] = $upload.upload({
                            url: Api.url() + "ng_upload/",
                            method: "POST",
                            file: g
                        }).then(function (b) {
                            toastr.success("image uploaded ok. refreshing the page..."), $scope.facility[e] = "images/facilities/" + b.data.msg, $scope.save_facility()
                        }, null, function (b) {
                            $scope.progress[c] = parseInt(100 * b.loaded / b.total)
                        })
                    }(f)
            }
        }, $scope.add_service = function (b) {
            var c = {
                child_id: b.id,
                parent_id: $scope.facility.id
            };
            Api.add_service(c).then(function (c) {
                console.log(c.data.data), $scope.facility.services.push(b)
            })
        }, $scope.remove_service = function (b) {
            var c = {
                child_id: b.id,
                parent_id: $scope.facility.id
            };
            Api.remove_service(c).then(function (c) {
                console.log(c.data.data);
                var d = $scope.facility.services.indexOf(b);
                d > -1 && $scope.facility.services.splice(d, 1)
            })
        }, $scope.add_provider = function (b) {
            var c = {
                child_id: b.id,
                parent_id: $scope.facility.id
            };
            Api.add_provider(c).then(function (c) {
                console.log(c.data.data), $scope.facility.providers.push(b)
            })
        }, $scope.remove_provider = function (b) {
            var c = {
                child_id: b.id,
                parent_id: $scope.facility.id
            };
            Api.remove_provider(c).then(function (c) {
                console.log(c.data.data);
                var d = $scope.facility.providers.indexOf(b);
                d > -1 && $scope.facility.providers.splice(d, 1)
            })
        }, $scope.add_user = function () {
            Api.add_user($scope.staff).then(function (b) {
                console.log(b.data), $scope.init()
            })
        }, $scope.remove_user = function (b) {
            Api.remove_user(b).then(function (b) {
                console.log(b.data), $scope.init()
            })
        }, $scope.upload_images = function () {}, $scope.save_facility = function () {
            var b = $scope.facility;
            Api.save_facility(b).then(function (a) {
                console.log(a.data.data), toastr.success("facility saved successfully")
            })
        }, $scope.service = {}, $scope.provider = {}, $scope.create_service_pre = function () {
            $("#modal-create-service").modal("show")
        }, $scope.create_provider_pre = function () {
            $("#modal-create-provider").modal("show")
        }, $scope.create_provider = function () {
            var b = $scope.provider;
            Api.create_provider(b).then(function () {
                $("#modal-create-provider").modal("hide"), toastr.success("provider created successfully"), Api.listing("insurances").then(function (b) {
                    $scope.providers = b.data.data
                })
            })
        }, $scope.create_service = function () {
            var b = $scope.service;
            Api.create_service(b).then(function () {
                $("#modal-create-service").modal("hide"), toastr.success("service created successfully"), Api.get_services().then(function (b) {
                    $scope.services = b.data.data
                })
            })
        }, $scope.selected_user = void 0, $scope.set_user = function () {
            console.log($scope.selected_user)
        }, $scope.init = function () {
            Api.listing("insurances").then(function (b) {
                $scope.providers = b.data.data
            }), Api.listing("users").then(function (b) {
                $scope.users = b.data.data
            }), Api.get_facility($routeParams).then(function (b) {
                $scope.facility = b.data.data, $scope.staff = {
                    fullname: "Shannons E Davis",
                    title: "Corporate",
                    email: "person@aol.com",
                    is_doctor: !1,
                    receive_sms: "0",
                    phone: "(210) 123-4567",
                    facilities_id: $scope.facility.id
                }, $scope.$watch("staff", function (b, c) {
                    $scope.is_doctor = !1, "Doctor" === c && ($scope.is_doctor = !0)
                })
            })
        }
    }
]);

angular.module("emedchoiceApp").filter("inArray", [
    function () {
        return function (a, b, c) {
            var d = c[a],
                e = !1;
            for (var f in d) f.id === b && (e = !0);
            return e
        }
    }
]);

angular.module("emedchoiceApp").filter("serviceProvided", [
    function () {
        return function (a, b) {
            for (var c = !1, d = 0; d < $(b).size(); d++) b[d].id === a && (c = !0);
            return c
        }
    }
]);

angular.module("emedchoiceApp").filter("insurancesAccepted", [
    function () {
        return function (a, b) {
            for (var c = !1, d = 0; d < $(b).size(); d++) b[d].id === a && (c = !0);
            return c
        }
    }
]);

angular.module("emedchoiceApp").directive("autoComplete", [
    function (a) {
        return function (b, c, d) {
            c.autocomplete({
                source: b[d.uiItems],
                select: function () {
                    a(function () {
                        c.trigger("input")
                    }, 0)
                }
            })
        }
    }
]);

angular.module("emedchoiceApp").controller("WatchlistCtrl", ["$scope", "$http", "Api", "Dataservice",
    function ($scope, $http, Api, Dataservice) {
        $scope.choices = Dataservice.get("choices", !0), $scope.user = Dataservice.get("user"), $scope.add_placement = function (b) {
            var c = parseInt(b),
                e = $scope.choices.indexOf(c); - 1 === e ? ($scope.choices.push(c), Dataservice.set("choices", $scope.choices), toastr.success("Provider added to choices list")) : toastr.error("Provider is already in your choices list")
        }, $scope.remove_watchlist_item = function (b) {
            Api.remove_watchlist_item({
                id: parseInt(b)
            }).then(function (b) {
                $scope.init(), b.data.error ? toastr.error(b.data.title) : toastr.success("Provider removed from watchlist successfully")
            })
        }, Api.get_watchlist({
            users_id: $scope.user.id
        }).then(function (b) {
            $scope.watchlist = b.data.data, console.log($scope.watchlist)
        }), $scope.init = function () {
            Api.get_watchlist({
                users_id: $scope.user.id
            }).then(function (b) {
                $scope.watchlist = b.data.data
            })
        }
    }
]);

angular.module("emedchoiceApp").controller("HistoryCtrl", ["$scope", "$http", "Api", "$routeParams",
    function ($scope, $http, Api, $routeParams) {
        $scope.init = function () {
            Api.get_facility($routeParams).then(function (b) {
                $scope.facility = b.data.data, $scope.report_totalsearches = 0, $scope.report_monthlyreferrals = 0, $scope.report_bedsfilled = 0, $scope.current_capacity = 0, $scope.report_qos = 0, $scope.report_avgcloseouttime = 0, $scope.report_referralsaccepted = 0, $scope.report_referralsdeferred = 0, $scope.report_hits = 0, $scope.report_conversions = 0, $scope.report_totalsearches = 0, $scope.report_hitpercentage = 0, $scope.report_conversionpercentage = 0, Api.report_totalsearches($scope.facility).then(function (b) {
                    b.data.error || ($scope.report_totalsearches = b.data.data)
                }), Api.get_history($scope.facility).then(function (b) {
                    $scope.history = b.data.data
                }), Api.report_monthlyreferrals($scope.facility).then(function (b) {
                    $scope.report_monthlyreferrals = b.data.data
                }), Api.report_bedsfilled($scope.facility).then(function (b) {
                    $scope.facility.current_capacity = b.data.msg, $scope.report_bedsfilled = b.data.data, $("#container-2").highcharts({
                        chart: {
                            polar: !0,
                            type: "line"
                        },
                        title: {
                            align: "left",
                            text: "Bed Placement Performance"
                        },
                        subtitle: {
                            align: "left",
                            text: "Covering the last 30 days. Based on bed placement constraints set by the provider"
                        },
                        pane: {
                            size: "80%"
                        },
                        xAxis: {
                            categories: ["Other", "Skilled", "Medicaid", "Medicaid Pending", "Charity"],
                            tickmarkPlacement: "on",
                            lineWidth: 0
                        },
                        yAxis: {
                            gridLineInterpolation: "polygon",
                            lineWidth: 0,
                            min: 0
                        },
                        tooltip: {
                            shared: !0,
                            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
                        },
                        legend: {
                            align: "right",
                            verticalAlign: "top",
                            y: 70,
                            layout: "vertical"
                        },
                        series: [{
                            name: "Capacity / Goal",
                            type: "area",
                            data: [parseInt($scope.facility.beds_other), parseInt($scope.facility.beds_skilled), parseInt($scope.facility.beds_medicaid), parseInt($scope.facility.beds_medicaid_pending), parseInt($scope.facility.beds_charity)],
                            pointPlacement: "on"
                        }, {
                            name: "Actual",
                            data: $scope.report_bedsfilled,
                            pointPlacement: "on"
                        }]
                    })
                }), Api.report_qos($scope.facility).then(function (b) {
                    $scope.report_qos = b.data.data, $("#container-3").highcharts({
                        chart: {
                            zoomType: "x",
                            spacingRight: 20
                        },
                        title: {
                            text: "Quality Of Service (QoS) Timeline"
                        },
                        xAxis: {
                            type: "datetime",
                            tickInterval: 26784e5,
                            tickWidth: 0,
                            gridLineWidth: 1,
                            labels: {
                                align: "left"
                            }
                        },
                        yAxis: {
                            title: {
                                text: "QoS Score"
                            }
                        },
                        tooltip: {
                            shared: !0
                        },
                        legend: {
                            enabled: !1
                        },
                        subtitle: {
                            text: void 0 === document.ontouchstart ? "Based on the average response time of referrals accepted" : "Based on the average response time of referrals accepted"
                        },
                        plotOptions: {
                            area: {
                                fillColor: {
                                    linearGradient: {
                                        x1: 0,
                                        y1: 0,
                                        x2: 0,
                                        y2: .7
                                    },
                                    stops: [
                                        [0, Highcharts.getOptions().colors[2]],
                                        [.9, Highcharts.Color(Highcharts.getOptions().colors[2]).setOpacity(0).get("rgba")]
                                    ]
                                },
                                lineWidth: 2,
                                marker: {
                                    enabled: !1
                                },
                                shadow: !1,
                                states: {
                                    hover: {
                                        lineWidth: 2
                                    }
                                },
                                threshold: null
                            }
                        },
                        series: [{
                            name: "QoS Score",
                            data: $scope.report_qos
                        }]
                    })
                }), Api.report_avgcloseouttime($scope.facility).then(function (b) {
                    if (!b.data.error) {
                        var c = b.data.data;
                        $scope.facility.report_avgcloseouttime = c;
                        var d, e = c.split(":");
                        switch (d = e[0], !0) {
                            case d >= 3:
                                $scope.facility.rating = "excellent";
                                break;
                            case d > 2:
                                $scope.facility.rating = "great";
                                break;
                            default:
                                $scope.facility.rating = "fair"
                        }
                    }
                }), Api.report_referralsaccepted($scope.facility).then(function (b) {
                    b.data.error || ($scope.facility.report_referralsaccepted = b.data.data)
                }), Api.report_referralsdeferred($scope.facility).then(function (b) {
                    b.data.error || ($scope.facility.report_referralsdeferred = b.data.data)
                }), Api.report_hits($scope.facility).then(function (b) {
                    b.data.error || ($scope.facility.report_hits = b.data.data)
                }), Api.report_conversions($scope.facility).then(function (b) {
                    b.data.error || ($scope.facility.report_conversions = b.data.data)
                })
            })
        }, $scope.$watch("facility.report_hits", function (b) {
            var c = b / $scope.report_totalsearches * 100;
            $scope.report_hitpercentage = Math.round(c)
        }), $scope.$watch("facility.report_conversions", function (b) {
            var c = b / $scope.report_totalsearches * 100;
            $scope.report_conversionpercentage = Math.round(c)
        })
    }
]);

angular.module("emedchoiceApp").controller("ReferralsCtrl", ["$scope", "$http", "Api", "$routeParams", "Dataservice",
    function ($scope, $http, Api, $routeParams, Dataservice) {
        $scope.user = Dataservice.get("user"), $scope.filter = {
            users_id: $scope.user.id,
            status: 0,
            bed_type: 3,
            refid: ""
        }, $scope.statuses = ["Pending", "Accepted", "Deferred"], $scope.beds = ["none", "Other", "Skilled", "Medicaid", "Medicaid Pending", "Charity"], $scope.init = function () {
            $scope.load_referrals()
        }, $scope.$watch("filter.refid", function (a) {
            "" !== $.trim(a) ? $(".withrefid").attr("disabled", "disabled") : $(".withrefid").removeAttr("disabled")
        }), $scope.load_referrals = function () {
            $scope.user.is_admin || ($scope.filter.refid = ""), Api.get_referrals($scope.filter).then(function (b) {
                $scope.referrals = b.data.data
            })
        }, $scope.clear = function () {
            $scope.filter.refid = "", $scope.load_referrals()
        }
    }
]);

angular.module("emedchoiceApp").controller("ReviewCtrl", ["$rootScope", "$scope", "$http", "Api", "$routeParams", "$location",
    function ($rootScope, $scope, $http, Api, $routeParams) {
        $scope.statuses = ["Pending", "Accepted", "Deferred"], $scope.beds = ["none", "Other", "Skilled", "Medicaid", "Medicaid Pending", "Charity"], $scope.validation = {
            token: $routeParams.token,
            error: !0,
            title: "Validating Request...",
            msg: "Please wait while we validate your referral review request."
        }, $scope.$watch("validation.facility.status", function (a) {
            switch (parseInt(a)) {
                case 1:
                    $("#facility_notes").removeAttr("disabled"), $("#facility_notes_label").show();
                    break;
                case 2:
                    $("#facility_notes").removeAttr("disabled"), $("#facility_notes_label").show();
                    break;
                default:
                    $("#facility_notes").attr("disabled", "disabled"), $("#facility_notes_label").hide()
            }
            console.log(parseInt(a))
        }), $scope.init = function () {
            NProgress.start(), Api.validate_token($scope.validation).then(function (c) {
                $rootScope.user.is_admin ? ($scope.validation.error = c.data.data.error, $scope.validation.title = c.data.data.title, $scope.validation.msg = c.data.data.msg, $scope.validation.facility = c.data.data.facility, $scope.validation.error && setTimeout(function () {
                    window.location = "https://www.google.com/"
                }, 5e3)) : ($scope.validation.error = !0, $scope.validation.title = "Invalid User Permissions", $scope.validation.msg = "Only an administrator can override a review request for a referral. You only have " + $rootScope.user.account_type + " access."), NProgress.done()
            })
        }, $scope.process_review = function () {
            NProgress.start(), $scope.validation.title = "Processing review...", $scope.validation.msg = "Please wait while we process your referral review.", $rootScope.user.is_admin ? Api.process_review($scope.validation).then(function (a) {
                var c = a.data;
                c.error ? ($scope.validation.error = !0, $scope.validation.title = c.title, $scope.validation.msg = c.msg) : ($scope.validation.error = !1, $scope.validation.title = c.title, $scope.validation.msg = c.msg, toastr.success(c.msg, c.title)), NProgress.done()
            }) : ($scope.validation.error = !0, $scope.validation.title = "Invalid Access", $scope.validation.msg = "You do not have access to this system.", toastr.warning($scope.validation.msg, $scope.validation.title), NProgress.done())
        }
    }
]);

angular.module("emedchoiceApp").controller("LoginCtrl", ["$scope", "$http", "Api", "$routeParams", "Dataservice", "$location",
    function ($scope, $http, Api, $routeParams, Dataservice, $location) {
        $scope.login_status = {
            error: !1,
            msg: ""
        }, $scope.user = {
            email: "",
            password: ""
        }, $scope.login_user = function () {
            Api.login_user($scope.user).then(function (b) {
                var c = b.data;
                c.error ? ($scope.user = {}, Dataservice.set("user", {}), $scope.login_status = {
                    error: !0,
                    msg: "Incorrect credentials provided!"
                }) : (toastr.success(c.msg, c.title), $scope.user = c.data, Dataservice.set("user", $scope.user), $location.url("/"), $scope.login_status = {
                    error: !1,
                    msg: ""
                })
            })
        }
    }
]);

angular.module("emedchoiceApp").controller("LogoutCtrl", ["$scope", "$http", "Api", "$routeParams", "Dataservice", "$location",
    function ($scope, $http, Api, $routeParams, Dataservice, $location) {
        $scope.init = function () {
            $scope.user = {}, Dataservice.set("user", {}), $location.url("/login")
        }
    }
]);

angular.module("emedchoiceApp").controller("IncompatibleCtrl", ["$scope",
    function () {}
]);

angular.module("emedchoiceApp").controller("AccountCtrl", ["$scope", "$http", "Api", "$routeParams", "Dataservice", "$location", "$rootScope", "$upload",
    function ($scope, $http, Api, $routeParams, Dataservice, $location, $rootScope, $upload) {
        $scope.user_levels = ["Guest", "Case Manager", "Case Manager Admin"], $scope.statuses = ["Pending", "Accepted", "Deferred"], $scope.usr = $rootScope.user, $scope.init = function () {
            Api.get_affiliates($rootScope.user).then(function (b) {
                $scope.affiliates = b.data.data
            }), Api.get_cm_performace($rootScope.user).then(function (b) {
                $scope.referrals = b.data.data
            })
        }, $scope.onSaveProfile = function () {
            Api.save_profile($scope.usr).then(function (a) {
                a.data.error ? toastr.error(a.data.msg, a.data.title) : ($rootScope.user = a.data.data, Dataservice.set("user", $rootScope.user), toastr.success(a.data.msg, a.data.title))
            })
        }, $scope.onFileSelect = function (b) {
            if ($scope.selectedFiles = [], $scope.upload && $scope.upload.length > 0)
                for (var d = 0; d < $scope.upload.length; d++) null !== $scope.upload[d] && $scope.upload[d].abort();
            $scope.upload = [], $scope.selectedFiles = b;
            for (var d = 0; d < b.length; d++) {
                var e = b[d];
                ! function (b) {
                    $scope.upload[b] = $upload.upload({
                        url: Api.url() + "ng_upload/",
                        method: "POST",
                        file: e
                    }).then(function (b) {
                        toastr.success("image uploaded ok"), $scope.usr.photo = b.data.msg
                    }, null, function () {})
                }(d)
            }
        }
    }
]);

angular.module("emedchoiceApp").directive("errSrc", [
    function () {
        return {
            link: function (a, b, c) {
                a.$watch(function () {
                    return c.ngSrc
                }, function (a) {
                    a || b.attr("src", c.errSrc)
                }), b.bind("error", function () {
                    b.attr("src", c.errSrc)
                })
            }
        }
    }
]);