/** * Created by sorcerer on 2017/10/25. */(function () {    'use strict';    angular.module('BlurAdmin.pages.servicedetil', [])        .config(routeConfig);    /** @ngInject */    function routeConfig($stateProvider) {        $stateProvider            .state('service_detil', {                url: '/servicedetil/:name',                templateUrl: 'app/pages/service_detil/service_detil.html',                controller: 'servicedetilCtrl',                title: 'service_detil',            })    }})();