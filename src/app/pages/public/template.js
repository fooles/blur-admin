/** * Created by sorcerer on 2017/11/7. */(function () {    'use strict';    angular.module('BlurAdmin.template', [])        .service('servicecreattemplate', ['$rootScope','Cookie',function ($rootScope,Cookie) {            $rootScope.namespace = Cookie.get('namespace');            this.dc = {                kind: "DeploymentConfig",                apiVersion: "v1",                metadata: {                    name: "",                    labels: {                        app: ""                    },                    annotations: {                        "dadafoundry.io/images-from": "public",                        "dadafoundry.io/create-by": $rootScope.namespace                    }                },                spec: {                    strategy: {},                    triggers: [],                    replicas: 1,                    selector: {                        app: "",                        deploymentconfig: ""                    },                    template: {                        metadata: {                            labels: {                                app: "",                                deploymentconfig: ""                            }                        },                        spec: {                            containers: [],                            "restartPolicy": "Always",                            "terminationGracePeriodSeconds": 30,                            "dnsPolicy": "ClusterFirst",                            "securityContext": {},                            'volumes': [],                        }                    },                    test: false                },                status: {}            };            this.containerTpl = {                name: "",                image: "",    //imageStreamTag                env: [],                resources: {                    "limits": {                        "cpu": null,                        "memory": null                    },                    "requests": {                        "cpu": null,                        "memory": null                    }                },                imagePullPolicy: "Always",                isimageChange: true,                secretsobj: {                    secretarr: []                    ,                    configmap: []                    ,                    persistentarr: []                }            };            this.horiz = {                "apiVersion": "autoscaling/v1",                "kind": "HorizontalPodAutoscaler",                "metadata": {"name": null, "labels": {"app": null}},                "spec": {                    "scaleTargetRef": {                        "kind": "DeploymentConfig",                        "name": null,                        "apiVersion": "extensions/v1beta1",                        "subresource": "scale"                    },                    "minReplicas": null,                    "maxReplicas": null,                    "targetCPUUtilizationPercentage": null                }            };            this.service = {                "kind": "Service",                "apiVersion": "v1",                "metadata": {                    "name": "",                    "labels": {                        "app": ""                    },                    annotations: {                        "dadafoundry.io/create-by": $rootScope.namespace                    }                },                "spec": {                    "ports": [],                    "selector": {                        "app": "",                        "deploymentconfig": ""                    },                    //"portalIP": "172.30.189.230",                    //"clusterIP": "172.30.189.230",                    "type": "ClusterIP",                    "sessionAffinity": "None"                }            };            this.route = {                "kind": "Route",                "apiVersion": "v1",                "metadata": {                    "name": "",                    "labels": {                        "app": ""                    },                    annotations: {                        "dadafoundry.io/create-by":$rootScope.namespace                    }                },                "spec": {                    "host": "",                    "to": {                        "kind": "Service",                        "name": ""                    },                    "port": {                        "targetPort": ""                    },                    "tls": {}                }            };        }])    /** @ngInject */})();