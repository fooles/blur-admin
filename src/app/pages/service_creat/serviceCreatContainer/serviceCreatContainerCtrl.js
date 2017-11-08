/** * Created by sorcerer on 2017/11/3. */(function () {    'use strict';    angular.module('BlurAdmin.pages.servicecreat')        .controller('serviceCreatContainerCtrl', serviceCreatContainerCtrl);    /** @ngInject */    function serviceCreatContainerCtrl($scope,ImageSelect,GLOBAL) {        $scope.rmContainer = function (idx) {            $scope.dc.spec.template.spec.containers.splice(idx, 1);        };        $scope.selectImage= function (idx) {            ImageSelect.open().then(function (image) {                var container=$scope.dc.spec.template.spec.containers[idx];                var imagename=image.metadata.name.split(':')[0];                var tagname=image.metadata.name.split(':')[1];                var conname=$scope.dc.spec.template.spec.containers[idx].name;                var imagetag = '';                if (imagename.split('/').length>1) {                    imagename=imagename.split('/')[1]                }                container.imagename=imagename;                container.tag=tagname;                container.name=conname?conname:imagename;                container.triggerImageTpl = {                    "type": "ImageChange",                    "imageChangeParams": {                        "automatic": true,                        "containerNames": [                            container.name                        ],                        "from": {                            "kind": "ImageStreamTag",                            "name": imagename+':'+tagname                        }                    }                };                imagetag='dadafoundry.io/image-' + imagename;                $scope.dc.metadata.annotations[imagetag] = image.metadata.name;                if (image.ispublicimage) {                    //公共                    container.image = GLOBAL.common_url + '/' + image.metadata.name;                }else {                    //私有                    container.image = image.image.dockerImageReference;                    if (image.image.dockerImageMetadata.Config.Labels) {                        container.ref = image.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];                        container.commitId = image.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'];                    }                    container.port = [];                    angular.forEach(image.image.dockerImageMetadata.Config.ExposedPorts, function (item, i) {                        container.port.push(i)                    });                    $scope.portsArr.splice(0,$scope.portsArr.length);                    angular.forEach($scope.dc.spec.template.spec.containers, function (con, i) {                        if (con.port) {                            angular.forEach(con.port, function (port, k) {                                var strarr = port.split('/');                                var val = strarr[1].toUpperCase();                                $scope.portsArr.push({                                    containerPort: parseInt(strarr[0]),                                    hostPort: parseInt(strarr[0]),                                    protocol: val,                                });                            })                        }                    })                }             })        }    }})();