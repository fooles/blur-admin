/** * Created by sorcerer on 2017/11/1. */(function () {    'use strict';    angular.module('BlurAdmin.pages.servicedetil')        .directive('serviceDetilEvent', serviceDetilEvent);    /** @ngInject */    function serviceDetilEvent() {        return {            restrict: 'E',            controller: 'serviceDetilEventCtrl',            templateUrl: 'app/pages/service_detil/serviceDetilEvent/serviceDetilEvent.html',            scope:false,        };    }})();