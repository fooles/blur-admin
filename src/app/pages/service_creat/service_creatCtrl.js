/** * Created by sorcerer on 2017/10/31. */(function () {    'use strict';    angular.module('BlurAdmin.pages.servicecreat')        .controller('servicecreatCtrl', servicecreatCtrl);    /** @ngInject */    function servicecreatCtrl($stateParams, updatadc, toastr, GLOBAL, $log, Cookie, $rootScope, $scope, Service, Route, horizontalpodautoscalers, DeploymentConfig, $state, servicecreattemplate) {        console.log('updatadc', updatadc);        $scope.updata = false;        $rootScope.namespace = Cookie.get('namespace');        $scope.portsArr = [];        $scope.envs = [];        $scope.switch = {            elastic: false,            route: false,            quota: false        };        $scope.checked = {            configChange: true,            port: null,            cname: '系统域名',            host: '',            tlsset: 'None',            httpset: 'None',            zsfile: {key: '请选择证书', value: ''},            syfile: {key: '请选择证书', value: ''},            cafile: {key: '请选择证书', value: ''},            mcafile: {key: '请选择证书', value: ''},            suffix: '.' + $rootScope.namespace + GLOBAL.service_url        }        $scope.quota = {            cpu: {                request: {                    cpuunit: 'millcores',                    cpuquota: null                },                limit: {                    cpuunit: 'millcores',                    cpuquota: null                }            },            memory: {                request: {                    memoryunit: 'MB',                    memoryquota: null                },                limit: {                    memoryunit: 'MB',                    memoryquota: null                }            }        }        $scope.tlsset = {            setone: ['None', 'Edge', 'Passthrough', 'Re-encrypt'],            httpset: ['None', 'Allow', 'Redirect']        }        $scope.containerTpl = angular.copy(servicecreattemplate.containerTpl);        $scope.horiz = angular.copy(servicecreattemplate.horiz);        $scope.service = angular.copy(servicecreattemplate.service);        $scope.route = angular.copy(servicecreattemplate.route);        if ($stateParams.name) {            $scope.updata=true;            $scope.creattext='更新'            $scope.dc = angular.copy(updatadc);            updatadcobj($scope.dc)        } else {            $scope.creattext='创建'            $scope.dc = angular.copy(servicecreattemplate.dc);        }        $scope.gotoadvan = function () {            $scope.nettap = $scope.nettap === '基本设置' ? '高级设置' : '基本设置';            if (!$scope.checked.port) {                $scope.checked.port = $scope.portsArr[0].containerPort + '(TCP)'            }        }        $scope.$watch('switch.elastic', function (n, o) {            if (n === o) {                return            }            if (n) {                $scope.switch.quota = true;            }        })        function updatadcobj(dc) {            updataBasic(dc);            updataAdvantage(dc);        }        function updataAdvantage(dc) {            loadRoute()            loadServe()            $scope.envs = dc.spec.template.spec.containers[0].env;            loadHor(dc)            loadQuota(dc)            if (dc.spec.triggers[0]) {                if (dc.spec.triggers[0].type === 'ConfigChange') {                    $scope.checked.ConfigChange=true;                }else {                    $scope.checked.ConfigChange=false;                }            }        }        function loadHor(dc) {            horizontalpodautoscalers.get({namespace: $rootScope.namespace, name: dc.metadata.name}, function (hor) {                //console.log('hor', hor);                $scope.switch.elastic = true;                $scope.horiz = hor;            })        }        function loadQuota(dc) {            if (dc.spec.template.spec.containers[0].resources) {                if (dc.spec.template.spec.containers[0].resources.requests.cpu) {                    $scope.quota.cpu.request.cpuunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.cpu).unit                    $scope.quota.cpu.request.cpuquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.cpu).nums                }                if (dc.spec.template.spec.containers[0].resources.requests.memory) {                    $scope.quota.memory.request.memoryunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.memory).unit                    $scope.quota.memory.request.memoryquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.memory).nums                }                if (dc.spec.template.spec.containers[0].resources.limits.cpu) {                    $scope.quota.cpu.limit.cpuunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.cpu).unit                    $scope.quota.cpu.limit.cpuquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.cpu).nums                }                if (dc.spec.template.spec.containers[0].resources.limits.memory) {                    $scope.quota.memory.limit.memoryunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.memory).unit                    $scope.quota.memory.limit.memoryquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.memory).nums                }            }        }        function loadRoute() {            Route.get({namespace: $rootScope.namespace, name: $scope.dc.metadata.name}, function (res) {                $scope.switch.route = true;                $scope.route = res;                $scope.checked.port = res.spec.port.targetPort.split('-')[0];                $scope.checked.host = res.spec.host.split('.')[0];                console.log('$scope.route', $scope.route);            })        }        function loadServe() {            Service.get({namespace: $rootScope.namespace, name: $scope.dc.metadata.name}, function (res) {                $scope.service = res                //$scope.portsArr=res.spec.ports                angular.forEach(res.spec.ports, function (port, i) {                    $scope.portsArr.unshift({                        containerPort: port.targetPort,                        protocol: port.protocol,                        hostPort: port.targetPort,                    })                })                console.log('service', $scope.service);            })        }        function ungeshihuan(num) {            var unit = '';            var nums = '';            $scope.quota.doquota = true;            //console.log(num.indexOf('Mi')>-1);            if (num.indexOf('Mi') > -1) {                unit = 'MB';                nums = parseFloat(num.replace('Mi', ""))            } else if (num.indexOf('m') > -1) {                unit = 'millcores';                nums = parseFloat(num.replace('m', ""))            } else if (num.indexOf('Gi') > -1) {                unit = 'GB';                nums = parseFloat(num.replace('Gi', ""))            } else {                unit = 'cores';                nums = parseFloat(num)            }            return {                unit: unit,                nums: nums            }        }        function updataBasic(dc) {            angular.forEach(dc.spec.template.spec.containers, function (con, i) {                if (con.volumeMounts && con.volumeMounts.length > 0) {                    con.advanconfg = true                } else {                    con.advanconfg = false                }                con.secretsobj = {                    secretarr: [],                    configmap: [],                    persistentarr: []                }                angular.forEach(con.volumeMounts, function (volue, k) {                    if (volue.name.indexOf('secrat') > -1) {                        updatagetvol(volue, 'secret', 'secretName', 'secretarr', dc, con)                    } else if (volue.name.indexOf('config') > -1) {                        updatagetvol(volue, 'configMap', 'name', 'configmap', dc, con)                    } else if (volue.name.indexOf('persistent') > -1) {                        updatagetvol(volue, 'persistentVolumeClaim', 'claimName', 'persistentarr', dc, con)                    }                })                updataimage(dc, con)            })        }        function updataimage(dc, con) {            var fullname = ''            if (con.image.indexOf('registry.dataos.io') > -1) {                fullname = con.image.split('/')[con.image.split('/').length - 1];            } else if (con.image.split('/')[2].split('@')[1].split(':')[0] === 'sha256') {                for (var k in dc.metadata.annotations) {                    if (k.indexOf('dadafoundry.io/image-') > -1) {                        fullname = dc.metadata.annotations[k];                    }                }            }            con.imagename = fullname.split(':')[0];            con.tag = fullname.split(':')[1];        }        function updatagetvol(volue, key, keyname, volarr, dc, con) {            angular.forEach(dc.spec.template.spec.volumes, function (vol, j) {                if (volue.name === vol.name) {                    var modelvol = {mountPath: volue.mountPath};                    modelvol[key] = {};                    modelvol[key][keyname] = vol[key][keyname];                    con.secretsobj[volarr].push(modelvol)                }            })        }        function prepareService(service, dc) {            service.metadata.name = dc.metadata.name;            service.metadata.labels.app = dc.metadata.name;            service.spec.selector.app = dc.metadata.name;            service.spec.selector.deploymentconfig = dc.metadata.name;        };        function createService(dc) {            prepareService($scope.service, dc);            var ps = [];            if ($scope.portsArr) {                var ports = $scope.portsArr;                for (var j = 0; j < ports.length; j++) {                    if (ports[j].hostPort) {                        var val = ports[j].protocol.toUpperCase()                        ps.push({                            name: ports[j].hostPort + '-' + ports[j].protocol.toLowerCase(),                            port: parseInt(ports[j].hostPort),                            protocol: val,                            targetPort: parseInt(ports[j].containerPort)                        });                    }                }            }            if (ps.length > 0) {                $scope.service.spec.ports = ps;            } else {                $scope.service.spec.ports = null;            }            Service.create({                namespace: $rootScope.namespace,                region: $rootScope.region            }, $scope.service, function (res) {                $scope.service = res;            }, function (res) {                $log.info("create service fail", res);            });        };        function imageChange(dc) {            for (var i = 0; i < dc.spec.template.spec.containers.length; i++) {                if (dc.spec.template.spec.containers[i].isimageChange) {                    dc.spec.triggers.push(dc.spec.template.spec.containers[i].triggerImageTpl)                }            }        }        function prepareRoute(route, service) {            route.metadata.name = service.metadata.name;            route.metadata.labels.app = service.metadata.name;            route.spec.host = $scope.checked.host + $scope.checked.suffix;            route.spec.to.name = service.metadata.name;            route.spec.port.targetPort = $scope.checked.port + '-tcp';        };        function createRoute(service) {            prepareRoute($scope.route, service);            if ($scope.checked.tlsset == 'Passthrough') {                $scope.route.spec.tls.termination = $scope.checked.tlsset;            } else if ($scope.checked.tlsset == 'Edge') {                $scope.route.spec.tls.termination = $scope.checked.tlsset;                $scope.route.spec.tls.insecureEdgeTerminationPolicy = $scope.checked.httpset;                if ($scope.checked.zsfile.value) {                    $scope.route.spec.tls.certificate = $scope.checked.zsfile.value                }                if ($scope.checked.syfile.value) {                    $scope.route.spec.tls.key = $scope.checked.syfile.value                }                if ($scope.checked.cafile.value) {                    $scope.route.spec.tls.caCertificate = $scope.checked.cafile.value                }            } else if ($scope.checked.tlsset == 'Re-encrypt') {                $scope.route.spec.tls.termination = $scope.checked.tlsset;                if ($scope.checked.zsfile.value) {                    $scope.route.spec.tls.certificate = $scope.checked.zsfile.value                }                if ($scope.checked.syfile.key) {                    $scope.route.spec.tls.key = $scope.checked.syfile.value                }                if ($scope.checked.cafile.value) {                    $scope.route.spec.tls.caCertificate = $scope.checked.cafile.value                }                if ($scope.checked.mcafile.value) {                    $scope.route.spec.tls.destinationCACertificate = $scope.checked.mcafile.value                }            } else {                delete $scope.route.spec.tls            }            Route.create({                namespace: $rootScope.namespace            }, $scope.route, function (res) {                $log.info("create route success", res);                $scope.route = res;            }, function (res) {                $log.info("create route fail", res);            });        };        function createHoriz() {            horizontalpodautoscalers.create({namespace: $rootScope.namespace}, $scope.horiz, function (data) {            })        }        function changestr(str) {            if (str.startsWith("/")) {                return changestr(str.replace("/", ""))            }            return "/" + str        }        function prepareDc(dc) {            var name = dc.metadata.name;            dc.metadata.labels.app = name;            dc.spec.selector.app = name;            dc.spec.selector.deploymentconfig = name;            dc.spec.template.metadata.labels.app = name;            dc.spec.template.metadata.labels.deploymentconfig = name;        };        function prepareVolume(dc) {            dc.spec.template.spec.volumes=[]            angular.forEach(dc.spec.template.spec.containers, function (con, i) {                if (!con.advanconfg) {                    delete dc.spec.template.spec.containers[i].secretsobj                } else {                    con.volumeMounts = [];                    if (con.secretsobj.secretarr.length > 0) {                        angular.forEach(con.secretsobj.secretarr, function (secret, k) {                            if (dc.spec.template.spec.containers[i].secretsobj.secretarr[k].secret.secretName !== '名称' && dc.spec.template.spec.containers[i].secretsobj.secretarr[k].mountPath !== "") {                                if (secret.mountPath.indexOf('/') !== 0) {                                    secret.mountPath = '/' + secret.mountPath                                } else {                                    secret.mountPath = changestr(secret.mountPath)                                }                                secret.name = "con" + i + "secrat" + k;                                var secretcopy = angular.copy(secret);                                dc.spec.template.spec.volumes.push(secretcopy)                                delete dc.spec.template.spec.containers[i].secretsobj.secretarr[k].secret                                con.volumeMounts.push(dc.spec.template.spec.containers[i].secretsobj.secretarr[k])                            } else {                                delete dc.spec.template.spec.containers[i].secretsobj.secretarr[k]                            }                        });                    }                    if (con.secretsobj.configmap.length > 0) {                        angular.forEach(con.secretsobj.configmap, function (config, k) {                            if (dc.spec.template.spec.containers[i].secretsobj.configmap[k].configMap.name !== '名称' && dc.spec.template.spec.containers[i].secretsobj.configmap[k].mountPath !== "") {                                if (config.mountPath.indexOf('/') !== 0) {                                    config.mountPath = '/' + config.mountPath                                } else {                                    config.mountPath = changestr(config.mountPath)                                }                                config.name = "con" + i + "config" + k;                                var configcopy = angular.copy(config);                                dc.spec.template.spec.volumes.push(configcopy)                                delete dc.spec.template.spec.containers[i].secretsobj.configmap[k].configMap                                con.volumeMounts.push(dc.spec.template.spec.containers[i].secretsobj.configmap[k])                            } else {                                delete dc.spec.template.spec.containers[i].secretsobj.configmap[k]                            }                        });                    }                    if (con.secretsobj.persistentarr.length > 0) {                        angular.forEach(con.secretsobj.persistentarr, function (persistent, k) {                            if (dc.spec.template.spec.containers[i].secretsobj.persistentarr[k].persistentVolumeClaim.claimName !== '名称' && dc.spec.template.spec.containers[i].secretsobj.persistentarr[k].mountPath !== "") {                                if (persistent.mountPath.indexOf('/') !== 0) {                                    persistent.mountPath = '/' + persistent.mountPath                                } else {                                    persistent.mountPath = changestr(persistent.mountPath)                                }                                persistent.name = "con" + i + "persistent" + k;                                var persistentcopy = angular.copy(persistent);                                dc.spec.template.spec.volumes.push(persistentcopy)                                delete dc.spec.template.spec.containers[i].secretsobj.persistentarr[k].persistentVolumeClaim.claimName                                con.volumeMounts.push(dc.spec.template.spec.containers[i].secretsobj.persistentarr[k])                            } else {                                delete dc.spec.template.spec.containers[i].secretsobj.persistentarr[k]                            }                        });                    }                    delete dc.spec.template.spec.containers[i].secretsobj                    angular.forEach(dc.spec.template.spec.volumes, function (volume, i) {                        delete dc.spec.template.spec.volumes[i].mountPath                    })                    //console.log('dc.spec.template.spec.containers', dc.spec.template.spec.containers);                }            })        };        function prepareTrigger(dc) {            if ($scope.checked.configChange) {                dc.spec.triggers.push({type: 'ConfigChange'});            }        };        function prepareHoriz(dc) {            var name = dc.metadata.name;            $scope.horiz.metadata.name = name;            $scope.horiz.metadata.labels.app = name;            $scope.horiz.spec.scaleTargetRef.name = name;            $scope.horiz.spec.minReplicas = dc.spec.replicas;            $scope.horiz.spec.maxReplicas = parseInt($scope.horiz.spec.maxReplicas) || dc.spec.replicas;            $scope.horiz.spec.targetCPUUtilizationPercentage = parseInt($scope.horiz.spec.targetCPUUtilizationPercentage) || 80;        }        function prepareEnv(dc) {            var containers = dc.spec.template.spec.containers;            var reg = new RegExp(/^[a-zA-Z_]+[a-zA-Z0-9_]*$/gi);            for (var i = 0; i < containers.length; i++) {                var thisenv = angular.copy($scope.envs);                for (var k = 0; k < $scope.envs.length; k++) {                    if (!$scope.envs[k].name) {                        thisenv.splice(k, 1);                    }                }                containers[i].env = thisenv;                for (var j = 0; j < containers[i].env.length; j++) {                    if (reg.test(containers[i].env[j].name) == false) {                        $scope.checkEnv = true;                        return false;                    }                }            }        };        function geshihuan(unit, num) {            if (!num) {            }            if (unit === 'millcores') {                return num ? parseFloat(num) + 'm' : false;            } else if (unit === 'cores') {                return num ? parseFloat(num) : false;            } else if (unit === 'MB') {                return num ? parseFloat(num) + 'Mi' : false;            } else if (unit === 'GB') {                return num ? parseFloat(num) + 'Gi' : false;            }        }        function prepareQuota(dc) {            if ($scope.switch.quota) {                angular.forEach(dc.spec.template.spec.containers, function (ports, i) {                    dc.spec.template.spec.containers[i].resources.requests.cpu = geshihuan($scope.quota.cpu.request.cpuunit, $scope.quota.cpu.request.cpuquota)                    dc.spec.template.spec.containers[i].resources.limits.cpu = geshihuan($scope.quota.cpu.limit.cpuunit, $scope.quota.cpu.limit.cpuquota)                    dc.spec.template.spec.containers[i].resources.requests.memory = geshihuan($scope.quota.memory.request.memoryunit, $scope.quota.memory.request.memoryquota)                    dc.spec.template.spec.containers[i].resources.limits.memory = geshihuan($scope.quota.memory.limit.memoryunit, $scope.quota.memory.limit.memoryquota)                    if (dc.spec.template.spec.containers[i].resources.requests.cpu === false) {                        //alert(1)                        delete dc.spec.template.spec.containers[i].resources.requests.cpu                    }                    if (dc.spec.template.spec.containers[i].resources.requests.memory === false) {                        //alert(1)                        delete dc.spec.template.spec.containers[i].resources.requests.memory                    }                    if (dc.spec.template.spec.containers[i].resources.limits.cpu === false) {                        delete dc.spec.template.spec.containers[i].resources.limits.cpu;                    }                    if (dc.spec.template.spec.containers[i].resources.limits.memory === false) {                        delete dc.spec.template.spec.containers[i].resources.limits.memory;                    }                    if (JSON.stringify(dc.spec.template.spec.containers[i].resources.limits) == "{}") {                        delete dc.spec.template.spec.containers[i].resources.limits                    }                    if (JSON.stringify(dc.spec.template.spec.containers[i].resources.requests) == "{}") {                        delete dc.spec.template.spec.containers[i].resources.requests                    }                    if (JSON.stringify(dc.spec.template.spec.containers[i].resources) == "{}") {                        delete dc.spec.template.spec.containers[i].resources                    }                })            } else {                angular.forEach(dc.spec.template.spec.containers, function (ports, i) {                    delete dc.spec.template.spec.containers[i].resources                })            }        }        function deleService() {            Service.delete({                namespace: $rootScope.namespace,                name: $scope.dc.metadata.name            }, function (res) {            })        }        function deleRoute() {            Route.delete({                namespace: $rootScope.namespace,                name: $scope.dc.metadata.name            }, function (res) {            })        }        function valid() {            if ($scope.switch.quota) {                if ($scope.quota.cpu.request.cpuquota && $scope.quota.cpu.limit.cpuquota) {                } else {                    toastr.error('请输入正确的cpu配额', '配额错误')                    return false                }            }            for (var i = 0; i < $scope.envs.length; i++) {                if ($scope.envs[i].name == '' || $scope.envs[i].value == '') {                    toastr.error('请输入正确的环境变量', '环境变量错误')                    return false;                }            }            return true        }        function createDcfn(dc) {            DeploymentConfig.create({                namespace: $rootScope.namespace            }, dc, function (res) {                $state.go('service_detil', {name: dc.metadata.name});            }, function (res) {                toastr.error('参数错误', '创建DC失败')            });        }        function updatedcput(dc) {            DeploymentConfig.put({                namespace: $rootScope.namespace,                name: dc.metadata.name            }, dc, function (res) {                $state.go('service_detil', {name: dc.metadata.name});            }, function (res) {                toastr.error('参数错误', '更新DC失败')            });        }        function updatahor(dc) {            horizontalpodautoscalers.put({namespace: $rootScope.namespace,name:dc.metadata.name}, $scope.horiz, function (data) {            })        }        $scope.createDc = function () {            var dc = angular.copy($scope.dc);            if (!valid()) {                return            }            prepareVolume(dc)            prepareQuota(dc)            imageChange(dc)            prepareDc(dc);            prepareTrigger(dc);            prepareEnv(dc);            deleService();            deleRoute();            if ($scope.portsArr[0]) {                createService(dc);            }            ;            if ($scope.switch.elastic) {                prepareHoriz(dc)                if (!$scope.horiz.metadata.resourceVersion) {                    updatahor(dc)                }else {                    createHoriz(dc)                }            }            if ($scope.switch.route) {                createRoute(dc);            }            if (dc.metadata.resourceVersion) {                updatedcput(dc)            }else {                createDcfn(dc);            }        };    }})();