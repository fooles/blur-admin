/** * Created by sorcerer on 2017/5/24. */(function () {    'use strict';    angular.module('BlurAdmin.service', [])        .service('Cookie', [function () {            this.set = function (key, val, expires) {                var date = new Date();                date.setTime(date.getTime() + expires);                document.cookie = key + "=" + val + "; expires=" + date.toUTCString();            };            this.get = function (key) {                var reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");                var arr = document.cookie.match(reg);                if (arr) {                    return (arr[2]);                }                return null            };            this.clear = function (key) {                this.set(key, "", -1);            };        }])        .service('MetricsService', [function () {            var midTime = function (point) {                return point.start + (point.end - point.start) / 2;            };            var millicoresUsed = function (point, lastValue) {                if (!lastValue || !point.value) {                    return null;                }                if (lastValue > point.value) {                    return null;                }                var timeInMillis = point.end - point.start;                var usageInMillis = (point.value - lastValue) / 1000000;                return (usageInMillis / timeInMillis) * 1000;            };            this.normalize = function (data, metric) {                var lastValue;                angular.forEach(data, function (point) {                    var value;                    if (!point.timestamp) {                        point.timestamp = midTime(point);                    }                    if (!point.value || point.value === "NaN") {                        var avg = point.avg;                        point.value = (avg && avg !== "NaN") ? avg : null;                    }                    if (metric === 'CPU') {                        value = point.value;                        point.value = millicoresUsed(point, lastValue);                        lastValue = value;                    }                });                data.shift();                return data;            };        }])        .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', 'Cookie', function ($rootScope, $q, AUTH_EVENTS, Cookie) {            var CODE_MAPPING = {                401: AUTH_EVENTS.loginNeeded,                403: AUTH_EVENTS.httpForbidden,                419: AUTH_EVENTS.loginNeeded,                440: AUTH_EVENTS.loginNeeded            };            return {                request: function (config) {                    if (/^\/signin/.test(config.url)) {                        return config;                    }                    //$rootScope.region=                    var token = Cookie.get('df_access_token');                    //console.log('config.headers',config.headers);                    if (config.headers && token) {                        config.headers["Authorization"] = "Bearer " + token;                    }                    if (/^\/hawkular/.test(config.url)) {                        config.headers["Hawkular-Tenant"] = $rootScope.namespace;                    }                    if (/^\/registry/.test(config.url)) {                        //var Auth = localStorage.getItem("Auth")                        config.headers["Authorization"] = "Basic " + Auth;                    }                    if (config.method == 'PATCH') {                        config.headers["Content-Type"] = "application/merge-patch+json";                    }                    //$rootScope.loading = true;                    return config                },                requestError: function (rejection) {                    //$rootScope.loading = false;                    return $q.reject(rejection);                },                response: function (res) {                    //$rootScope.loading = false;                    return res;                },                responseError: function (response) {                    //alert(11)                    //$rootScope.loading = false;                    var val = CODE_MAPPING[response.status];                    if (val) {                        $rootScope.$broadcast(val, response);                    }                    return $q.reject(response);                }            };        }])        .service('Sort', [function () {            this.sort = function (items, reverse) {                if (!reverse || reverse == 0) {                    reverse = 1;                }                items.sort(function (a, b) {                    if (!a.metadata) {                        return 0;                    }                    return reverse * ((new Date(a.metadata.creationTimestamp)).getTime() - (new Date(b.metadata.creationTimestamp)).getTime());                });                return items;            };        }])    /** @ngInject */})();