/** * Created by sorcerer on 2017/10/25. */(function () {    'use strict';angular.module('BlurAdmin.pages.servicedetil')    .controller('servicedetilCtrl', servicedetilCtrl);/** @ngInject */function servicedetilCtrl($scope,$uibModal) {    $scope.testarr = [];    $scope.addProtTitle = true;    $scope.teston = true;    $scope.onoroff = function(){        if($scope.teston){            $scope.teston = false;        }else{            $scope.teston = true        }    };    $scope.test = function(){        $scope.testarr.push({name:'name1'})    };    $scope.portOpenArr = [        {name: "name0", $$hashKey: "object:316"},        {name: "name9", $$hashKey: "object:317"}        ];    $scope.portOpen=function(){        $scope.addProtTitle = true;        $scope.portOpenArr.push({name:'name1'});        console.log("123455",$scope.portOpenArr);    };    $scope.del = function (idx) {        $scope.testarr.splice(idx,1);    };    $scope.open = function (page, size){        $uibModal.open({            animation: true,            templateUrl: page,            size: size,            resolve: {                items: function () {                    return $scope.items;                }            }        });    };    $scope.delPort = function(idx){        $scope.portOpenArr.splice(idx,1);        if(!$scope.portOpenArr.length){            // $("#addProtTitle").css("display",'none');            $scope.addProtTitle = false;        }    };        $scope.standardSelectItems = [            {label: 'Option 21', value: 1},            {label: 'Option 22', value: 2},            {label: 'Option 23', value: 3},            {label: 'Option 24', value: 4}        ];        $scope.thisName = {}};})();