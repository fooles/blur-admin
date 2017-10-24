/** * Created by sorcerer on 2017/3/8. */(function () {    'use strict';    angular.module('BlurAdmin.resource', ['ngResource'])        .factory('Ws', ['$rootScope', '$ws', '$log', 'GLOBAL', 'Cookie', function ($rootScope, $ws, $log, GLOBAL, Cookie) {            var Ws = {};            $rootScope.watches = $rootScope.watches || {};            Ws.watch = function (params, onmessage, onopen, onclose) {                if (!$ws.available()) {                    $log.info('webSocket is not available');                    return;                }                var wsscheme = "wss://";                if (window.location.protocol != "https:") {                    // wsscheme = "wss://";                    wsscheme = "ws://";                }                var host = wsscheme + location.host;                console.log('host', host);                console.log('location', location);                // var host = wsscheme;                //var tokens = Cookie.get('df_access_token');                var regions = 'cn-north-1';                //var tokenarr = tokens.split(',');                var region = regions.split('-')[2];                var token = '';                //var token = tokenarr[region-1];                if (params.api == 'k8s') {                    host = host + GLOBAL.host_wss_k8s;                    // host=host+'dev.dataos.io:8443/api/v1';                } else {                    //var token = tokenarr[0];                    host = host + GLOBAL.host_wss;                }                var tokens = Cookie.get('df_access_token');                var regions = Cookie.get('region');                var tokenarr = tokens.split(',');                var region = regions.split('-')[2];                var token = tokenarr[region - 1];                params.name = params.name ? '/' + params.name : '';                if (params.pod) {                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +                        '?follow=true' +                        '&tailLines=1000' +                        '&limitBytes=10485760' +                        '&container=' + params.pod +                        '&region=cn-north-1'  +                        '&access_token=' + token;                } else if (params.app) {                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +                        '?watch=true' +                        '&resourceVersion=' + params.resourceVersion +                        '&labelSelector=' + params.app +                        '&region=cn-north-1'  +                        '&access_token=' + token;                } else {                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +                        '?watch=true' +                        '&resourceVersion=' + params.resourceVersion +                        '&region=cn-north-1' +                        '&access_token=' + token;                }                if (params.protocols) {                    $ws({                        method: 'WATCH',                        url: url,                        onclose: onclose,                        onmessage: onmessage,                        onopen: onopen,                        protocols: params.protocols                    }).then(function (ws) {                        $rootScope.watches[Ws.key(params.namespace, params.type, params.name)] = ws;                    });                } else {                    $ws({                        method: 'WATCH',                        url: url,                        onclose: onclose,                        onmessage: onmessage,                        onopen: onopen,                    }).then(function (ws) {                        $rootScope.watches[Ws.key(params.namespace, params.type, params.name)] = ws;                    });                }            };            Ws.key = function (namespace, type, name) {                return namespace + '-' + type + '-' + name;            };            Ws.clear = function () {                for (var k in $rootScope.watches) {                    $rootScope.watches[k].shouldClose = true;                    $rootScope.watches[k].close();                }                $rootScope.watches = {};            };            return Ws;        }])        .factory('DeploymentConfig', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var DeploymentConfig = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name', {                name: '@name',                namespace: '@namespace'            }, {                create: {method: 'POST'},                put: {method: 'PUT'},                patch: {method: "PATCH"}            });            DeploymentConfig.log = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name/log', {                name: '@name',                namespace: '@namespace'            }, {                create: {method: 'POST'},                put: {method: 'PUT'},                patch: {method: "PATCH"}            });            return DeploymentConfig;        }])        .factory('ReplicationController', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var ReplicationController = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/replicationcontrollers/:name', {                name: '@name',                namespace: '@namespace'            }, {                create: {method: 'POST'},                put: {method: 'PUT'}            });            return ReplicationController;        }])        .factory('Route', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var Route = $resource(GLOBAL.host + '/namespaces/:namespace/routes/:name', {                name: '@name',                namespace: '@namespace'            }, {                create: {method: 'POST'},                put: {method: 'PUT'},                delete: {method: "DELETE"}            });            return Route;        }])        .factory('User', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var User = $resource(GLOBAL.host + '/users/:name', {name: '@name'}, {                create: {method: 'POST'}            });            return User;        }])        .factory('Project', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var Project = $resource(GLOBAL.host + '/projects/:name', {name: '@name'}, {                create: {method: 'POST'}            });            return Project;        }])        .factory('Metrics', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var Metrics = {};            Metrics.mem = $resource(GLOBAL.host_hawkular + '/gauges/:gauges/data', {                gauges: '@gauges',                buckets: '@buckets',                start: '@start'            });            Metrics.cpu = $resource(GLOBAL.host_hawkular + '/counters/:counters/data', {                counters: '@counters',                buckets: '@buckets',                start: '@start'            });            Metrics.network = $resource(GLOBAL.host_hawkular + '/network/:network/data', {                network: '@network',                buckets: '@buckets',                start: '@start'            });            Metrics.mem.all = $resource(GLOBAL.host_hawkular + '/gauges/data', {tags: '@tags', buckets: '@buckets'});            Metrics.network.all = $resource(GLOBAL.host_hawkular + '/gauges/data', {tags: '@tags', buckets: '@buckets'});            Metrics.cpu.all = $resource(GLOBAL.host_hawkular + '/counters/data', {tags: '@tags', buckets: '@buckets'});            return Metrics;        }])        .factory('BuildConfig', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var BuildConfig = $resource(GLOBAL.host + '/namespaces/:namespace/buildconfigs/:name', {                name: '@name',                namespace: '@namespace'            }, {                create: {method: 'POST'},                put: {method: 'PUT'}            });            BuildConfig.instantiate = $resource(GLOBAL.host + '/namespaces/:namespace/buildconfigs/:name/instantiate', {                name: '@name',                namespace: '@namespace'            }, {                create: {method: 'POST'}            });            return BuildConfig;        }])        .factory('Build', ['$resource', '$rootScope', '$log', 'Cookie', 'GLOBAL', function ($resource, $rootScope, $log, Cookie, GLOBAL) {            var Build = $resource(GLOBAL.host + '/namespaces/:namespace/builds/:name', {                name: '@name',                namespace: '@namespace'            }, {                create: {method: 'POST'},                put: {method: 'PUT'}            });            Build.log = $resource(GLOBAL.host + '/namespaces/:namespace/builds/:name/log', {                name: '@name',                namespace: '@namespace'            }, {                get: {method: 'GET', responseType: 'text'}            });            return Build;        }])        .factory('resourcequotas', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {            var resourcequotas = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/resourcequotas', {                namespace: '@namespace',            });            //暂未使用            return resourcequotas;        }])    /** @ngInject */})();