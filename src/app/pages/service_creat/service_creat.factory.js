/** * Created by sorcerer on 2017/10/31. */(function () {    'use strict';    angular.module('BlurAdmin.pages.servicecreat')        .factory('serviceCreatPrepare', serviceCreatPrepare)        .factory('serviceCreatCreat', serviceCreatCreat)        .factory('serviceCreatLoad', serviceCreatLoad)        .factory('serviceCreatUpdate', serviceCreatUpdate)        .factory('serviceCreatValidate', serviceCreatValidate)        .factory('serviceCreatDelete', serviceCreatDelete)    function serviceCreatPrepare(Cookie) {        var namespace = Cookie.get('namespace');        function changestr(str) {            if (str.startsWith("/")) {                return changestr(str.replace("/", ""))            }            return "/" + str        }        function geshihuan(unit, num) {            if (!num) {            }            if (unit === 'millcores') {                return num ? parseFloat(num) + 'm' : false;            } else if (unit === 'cores') {                return num ? parseFloat(num) : false;            } else if (unit === 'MB') {                return num ? parseFloat(num) + 'Mi' : false;            } else if (unit === 'GB') {                return num ? parseFloat(num) + 'Gi' : false;            }        }        var serviceCreatFactory = {};        serviceCreatFactory.prepareimageChange = function (dc) {            angular.forEach(dc.spec.template.spec.containers, function (con) {                if (con.isimageChange) {                    dc.spec.triggers.push(con.triggerImageTpl)                }            })        }        serviceCreatFactory.prepareRoute = function (route, dc, checked) {            route.metadata.name = dc.metadata.name;            route.metadata.labels.app = dc.metadata.name;            route.spec.host = checked.host + checked.suffix;            route.spec.to.name = dc.metadata.name;            route.spec.port.targetPort = checked.port + '-tcp';            //console.log('checked.tlsset',checked.tlsset);            if (checked.tlsset == 'passthrough') {                route.spec.tls.termination = checked.tlsset;            } else if (checked.tlsset == 'edge') {                route.spec.tls.termination = checked.tlsset;                route.spec.tls.insecureEdgeTerminationPolicy = checked.httpset;                if (checked.zsfile.value) {                    route.spec.tls.certificate = checked.zsfile.value                }                if (checked.syfile.value) {                    route.spec.tls.key = checked.syfile.value                }                if (checked.cafile.value) {                    route.spec.tls.caCertificate = checked.cafile.value                }            } else if (checked.tlsset == 're-encrypt') {                route.spec.tls.termination = checked.tlsset;                if (checked.zsfile.value) {                    route.spec.tls.certificate = checked.zsfile.value                }                if (checked.syfile.key) {                    route.spec.tls.key = checked.syfile.value                }                if (checked.cafile.value) {                    route.spec.tls.caCertificate = checked.cafile.value                }                if (checked.mcafile.value) {                    route.spec.tls.destinationCACertificate = checked.mcafile.value                }            } else {                delete route.spec.tls            }        };        serviceCreatFactory.prepareEnv = function (dc, evns) {            var containers = dc.spec.template.spec.containers;            var reg = new RegExp(/^[a-zA-Z_]+[a-zA-Z0-9_]*$/gi);            for (var i = 0; i < containers.length; i++) {                var thisenv = angular.copy(evns);                for (var k = 0; k < evns.length; k++) {                    if (!evns[k].name) {                        thisenv.splice(k, 1);                    }                }                containers[i].env = thisenv;                for (var j = 0; j < containers[i].env.length; j++) {                    if (reg.test(containers[i].env[j].name) == false) {                        return false;                    }                }            }        };        serviceCreatFactory.prepareTrigger = function (dc, configChange) {            if (configChange) {                dc.spec.triggers.push({type: 'ConfigChange'});            } else {                //var arr = angular.copy(dc.spec.triggers)                angular.forEach(dc.spec.triggers, function (trigger, i) {                    if (trigger) {                        if (trigger.type && trigger.type === 'ConfigChange') {                            dc.spec.triggers.splice(i, 1)                        }                    }                })                //dc.spec.triggers = arr;            }        }        serviceCreatFactory.prepareDc = function (dc) {            var name = dc.metadata.name;            dc.metadata.labels.app = name;            dc.spec.selector.app = name;            dc.spec.selector.deploymentconfig = name;            dc.spec.template.metadata.labels.app = name;            dc.spec.template.metadata.labels.deploymentconfig = name;        };        serviceCreatFactory.prepareHoriz = function (dc, horiz) {            var name = dc.metadata.name;            horiz.metadata.name = name;            horiz.metadata.labels.app = name;            horiz.spec.scaleTargetRef.name = name;            horiz.spec.minReplicas = dc.spec.replicas;            horiz.spec.maxReplicas = parseInt(horiz.spec.maxReplicas) || dc.spec.replicas;            horiz.spec.targetCPUUtilizationPercentage = parseInt(horiz.spec.targetCPUUtilizationPercentage) || 80;        }        serviceCreatFactory.prepareService = function (dc, service, portsarr) {            //console.log('service', service);            service.metadata.name = dc.metadata.name;            service.metadata.labels.app = dc.metadata.name;            service.spec.selector.app = dc.metadata.name;            service.spec.selector.deploymentconfig = dc.metadata.name;            var ps = [];            if (portsarr) {                var ports = portsarr;                for (var j = 0; j < ports.length; j++) {                    if (ports[j].hostPort) {                        var val = ports[j].protocol.toUpperCase()                        ps.push({                            name: ports[j].hostPort + '-' + ports[j].protocol.toLowerCase(),                            port: parseInt(ports[j].hostPort),                            protocol: val,                            targetPort: parseInt(ports[j].containerPort)                        });                    }                }            }            if (ps.length > 0) {                service.spec.ports = ps;            } else {                service.spec.ports = null;            }        }        serviceCreatFactory.prepareQuota = function (dc, switchquot, quota) {            if (switchquot) {                angular.forEach(dc.spec.template.spec.containers, function (ports, i) {                    dc.spec.template.spec.containers[i].resources.requests.cpu = geshihuan(quota.cpu.request.cpuunit, quota.cpu.request.cpuquota)                    dc.spec.template.spec.containers[i].resources.limits.cpu = geshihuan(quota.cpu.limit.cpuunit, quota.cpu.limit.cpuquota)                    dc.spec.template.spec.containers[i].resources.requests.memory = geshihuan(quota.memory.request.memoryunit, quota.memory.request.memoryquota)                    dc.spec.template.spec.containers[i].resources.limits.memory = geshihuan(quota.memory.limit.memoryunit, quota.memory.limit.memoryquota)                    if (dc.spec.template.spec.containers[i].resources.requests.cpu === false) {                        delete dc.spec.template.spec.containers[i].resources.requests.cpu                    }                    if (dc.spec.template.spec.containers[i].resources.requests.memory === false) {                        delete dc.spec.template.spec.containers[i].resources.requests.memory                    }                    if (dc.spec.template.spec.containers[i].resources.limits.cpu === false) {                        delete dc.spec.template.spec.containers[i].resources.limits.cpu;                    }                    if (dc.spec.template.spec.containers[i].resources.limits.memory === false) {                        delete dc.spec.template.spec.containers[i].resources.limits.memory;                    }                    if (JSON.stringify(dc.spec.template.spec.containers[i].resources.limits) == "{}") {                        delete dc.spec.template.spec.containers[i].resources.limits                    }                    if (JSON.stringify(dc.spec.template.spec.containers[i].resources.requests) == "{}") {                        delete dc.spec.template.spec.containers[i].resources.requests                    }                    if (JSON.stringify(dc.spec.template.spec.containers[i].resources) == "{}") {                        delete dc.spec.template.spec.containers[i].resources                    }                })            } else {                angular.forEach(dc.spec.template.spec.containers, function (ports, i) {                    delete dc.spec.template.spec.containers[i].resources                })            }        }        serviceCreatFactory.prepareVolume = function (dc) {            dc.spec.template.spec.volumes = []            angular.forEach(dc.spec.template.spec.containers, function (con, i) {                if (!con.advanconfg) {                    delete dc.spec.template.spec.containers[i].secretsobj                } else {                    con.volumeMounts = [];                    if (con.secretsobj.secretarr.length > 0) {                        angular.forEach(con.secretsobj.secretarr, function (secret, k) {                            if (dc.spec.template.spec.containers[i].secretsobj.secretarr[k].secret.secretName !== '名称' && dc.spec.template.spec.containers[i].secretsobj.secretarr[k].mountPath !== "") {                                if (secret.mountPath.indexOf('/') !== 0) {                                    secret.mountPath = '/' + secret.mountPath                                } else {                                    secret.mountPath = changestr(secret.mountPath)                                }                                secret.name = "con" + i + "secrat" + k;                                var secretcopy = angular.copy(secret);                                dc.spec.template.spec.volumes.push(secretcopy)                                delete dc.spec.template.spec.containers[i].secretsobj.secretarr[k].secret                                con.volumeMounts.push(dc.spec.template.spec.containers[i].secretsobj.secretarr[k])                            } else {                                delete dc.spec.template.spec.containers[i].secretsobj.secretarr[k]                            }                        });                    }                    if (con.secretsobj.configmap.length > 0) {                        angular.forEach(con.secretsobj.configmap, function (config, k) {                            if (dc.spec.template.spec.containers[i].secretsobj.configmap[k].configMap.name !== '名称' && dc.spec.template.spec.containers[i].secretsobj.configmap[k].mountPath !== "") {                                if (config.mountPath.indexOf('/') !== 0) {                                    config.mountPath = '/' + config.mountPath                                } else {                                    config.mountPath = changestr(config.mountPath)                                }                                config.name = "con" + i + "config" + k;                                var configcopy = angular.copy(config);                                dc.spec.template.spec.volumes.push(configcopy)                                delete dc.spec.template.spec.containers[i].secretsobj.configmap[k].configMap                                con.volumeMounts.push(dc.spec.template.spec.containers[i].secretsobj.configmap[k])                            } else {                                delete dc.spec.template.spec.containers[i].secretsobj.configmap[k]                            }                        });                    }                    if (con.secretsobj.persistentarr.length > 0) {                        angular.forEach(con.secretsobj.persistentarr, function (persistent, k) {                            if (dc.spec.template.spec.containers[i].secretsobj.persistentarr[k].persistentVolumeClaim.claimName !== '名称' && dc.spec.template.spec.containers[i].secretsobj.persistentarr[k].mountPath !== "") {                                if (persistent.mountPath.indexOf('/') !== 0) {                                    persistent.mountPath = '/' + persistent.mountPath                                } else {                                    persistent.mountPath = changestr(persistent.mountPath)                                }                                persistent.name = "con" + i + "persistent" + k;                                var persistentcopy = angular.copy(persistent);                                dc.spec.template.spec.volumes.push(persistentcopy)                                delete dc.spec.template.spec.containers[i].secretsobj.persistentarr[k].persistentVolumeClaim.claimName                                con.volumeMounts.push(dc.spec.template.spec.containers[i].secretsobj.persistentarr[k])                            } else {                                delete dc.spec.template.spec.containers[i].secretsobj.persistentarr[k]                            }                        });                    }                    delete dc.spec.template.spec.containers[i].secretsobj                    angular.forEach(dc.spec.template.spec.volumes, function (volume, i) {                        delete dc.spec.template.spec.volumes[i].mountPath                    })                }            })        };        return serviceCreatFactory;    }    function serviceCreatCreat(Service, DeploymentConfig, $state, toastr, Cookie, Route, horizontalpodautoscalers) {        var namespace = Cookie.get('namespace');        var serviceCreatCreat = {}        serviceCreatCreat.createDc = function (dc) {            DeploymentConfig.create({                namespace: namespace            }, dc, function (res) {                $state.go('service_detil', {name: dc.metadata.name});            }, function (res) {                console.log('res', res);                if (res.status === 409) {                    toastr.error('服务名重复', '创建DC失败');                } else {                    toastr.error('参数错误', '创建DC失败');                }            });        }        serviceCreatCreat.createService = function (service) {            Service.create({                namespace: namespace            }, service, function (res) {            }, function (res) {            });        };        serviceCreatCreat.createRoute = function (route) {            Route.create({                namespace: namespace            }, route, function (res) {                //console.log('res', res);            }, function (res) {            });        };        serviceCreatCreat.createHoriz = function (horiz) {            horizontalpodautoscalers.create({                namespace: namespace            }, horiz, function (data) {            })        }        return serviceCreatCreat;    }    function serviceCreatLoad(Cookie,Route,Service,horizontalpodautoscalers) {        var namespace = Cookie.get('namespace');        function loadvol(volue, key, keyname, volarr, dc, con) {            angular.forEach(dc.spec.template.spec.volumes, function (vol, j) {                if (volue.name === vol.name) {                    var modelvol = {mountPath: volue.mountPath};                    modelvol[key] = {};                    modelvol[key][keyname] = vol[key][keyname];                    con.secretsobj[volarr].push(modelvol)                }            })        }        function loadimage(dc, con) {            var fullname = ''            if (con.image.indexOf('registry.dataos.io') > -1) {                fullname = con.image.split('/')[con.image.split('/').length - 1];            } else if (con.image.split('/')[2].split('@')[1].split(':')[0] === 'sha256') {                for (var k in dc.metadata.annotations) {                    if (k.indexOf('dadafoundry.io/image-') > -1) {                        fullname = dc.metadata.annotations[k];                    }                }            }            con.imagename = fullname.split(':')[0];            con.tag = fullname.split(':')[1];        }        function ungeshihuan(num) {            var unit = '';            var nums = '';            //console.log(num.indexOf('Mi')>-1);            if (num.indexOf('Mi') > -1) {                unit = 'MB';                nums = parseFloat(num.replace('Mi', ""))            } else if (num.indexOf('m') > -1) {                unit = 'millcores';                nums = parseFloat(num.replace('m', ""))            } else if (num.indexOf('Gi') > -1) {                unit = 'GB';                nums = parseFloat(num.replace('Gi', ""))            } else {                unit = 'cores';                nums = parseFloat(num)            }            return {                unit: unit,                nums: nums            }        }        var serviceCreatLoad = {};        serviceCreatLoad.loadBasic=function (dc) {            angular.forEach(dc.spec.template.spec.containers, function (con, i) {                if (con.volumeMounts && con.volumeMounts.length > 0) {                    con.advanconfg = true                } else {                    con.advanconfg = false                }                con.secretsobj = {                    secretarr: [],                    configmap: [],                    persistentarr: []                }                angular.forEach(con.volumeMounts, function (volue, k) {                    if (volue.name.indexOf('secrat') > -1) {                        loadvol(volue, 'secret', 'secretName', 'secretarr', dc, con)                    } else if (volue.name.indexOf('config') > -1) {                        loadvol(volue, 'configMap', 'name', 'configmap', dc, con)                    } else if (volue.name.indexOf('persistent') > -1) {                        loadvol(volue, 'persistentVolumeClaim', 'claimName', 'persistentarr', dc, con)                    }                })                loadimage(dc, con)            })        }        serviceCreatLoad.loadRoute=function (switchs,checked,dc,callback) {            Route.get({namespace: namespace, name: dc.metadata.name}, function (res) {                switchs.route = true;                checked.port = res.spec.port.targetPort.split('-')[0];                checked.host = res.spec.host.split('.')[0];                if (res.spec.tls) {                    if (res.spec.tls.termination) {                        checked.tlsset = res.spec.tls.termination;                    }                    if (res.spec.tls.insecureEdgeTerminationPolicy) {                        checked.httpset = res.spec.tls.insecureEdgeTerminationPolicy                    }                    if (res.spec.tls.certificate) {                        checked.zsfile = {                            value: res.spec.tls.certificate,                            key: '证书.crt'                        }                    }                    if (res.spec.tls.key) {                        checked.syfile = {                            value: res.spec.tls.key,                            key: '密钥.crt'                        }                    }                    if (res.spec.tls.caCertificate) {                        checked.cafile = {                            value: res.spec.tls.caCertificate,                            key: 'ca证书.crt'                        }                    }                    if (res.spec.tls.destinationCACertificate) {                        checked.mcafile = {                            value: res.spec.tls.destinationCACertificate,                            key: '目标ca证书.crt'                        }                    }                } else {                    res.spec.tls = {};                }                callback(res)            })        }        serviceCreatLoad.loadServe=function (portsArr,dc,callback) {            Service.get({namespace:namespace, name: dc.metadata.name}, function (res) {                angular.forEach(res.spec.ports, function (port, i) {                    portsArr.unshift({                        containerPort: port.targetPort,                        protocol: port.protocol,                        hostPort: port.targetPort,                    })                })                callback(res);            })        }        serviceCreatLoad.loadHor=function (switchs,dc,callback) {            horizontalpodautoscalers.get({namespace:namespace, name: dc.metadata.name}, function (hor) {                switchs.elastic = true;                callback(hor)            })        }        serviceCreatLoad.loadenvs=function (dc){            return dc.spec.template.spec.containers[0].env || [];        }        serviceCreatLoad.LoadConfigchange=function (dc){            var biaoji=false            angular.forEach(dc.spec.triggers, function (trigger, i) {                if (trigger) {                    if (trigger.type && trigger.type === 'ConfigChange') {                        biaoji=true                    }                }            })            return biaoji        }        serviceCreatLoad.loadQuota=function (quota,switchs,dc) {            if (dc.spec.template.spec.containers[0].resources && dc.spec.template.spec.containers[0].resources.requests) {                switchs.quota = true;                if (dc.spec.template.spec.containers[0].resources.requests.cpu) {                    quota.cpu.request.cpuunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.cpu).unit                    quota.cpu.request.cpuquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.cpu).nums                }                if (dc.spec.template.spec.containers[0].resources.requests.memory) {                    quota.memory.request.memoryunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.memory).unit                    quota.memory.request.memoryquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.requests.memory).nums                }                if (dc.spec.template.spec.containers[0].resources.limits.cpu) {                    quota.cpu.limit.cpuunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.cpu).unit                    quota.cpu.limit.cpuquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.cpu).nums                }                if (dc.spec.template.spec.containers[0].resources.limits.memory) {                    quota.memory.limit.memoryunit = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.memory).unit                    quota.memory.limit.memoryquota = ungeshihuan(dc.spec.template.spec.containers[0].resources.limits.memory).nums                }            } else {                angular.forEach(dc.spec.template.spec.containers, function (con, i) {                    con.resources = {                        "limits": {                            "cpu": null,                            "memory": null                        },                        "requests": {                            "cpu": null,                            "memory": null                        }                    }                })            }        }        return serviceCreatLoad;    }    function serviceCreatUpdate(Cookie,Service,Route,horizontalpodautoscalers,DeploymentConfig,$state,toastr) {        var namespace = Cookie.get('namespace');        var serviceCreatUpdate = {};        serviceCreatUpdate.updataseervice= function (servicedate) {            Service.put({                namespace:namespace,                name: servicedate.metadata.name            }, servicedate, function (res) {            }, function (res) {            });        }        serviceCreatUpdate.updataroute=function (routedate) {            Route.put({                namespace: namespace,                name: routedate.metadata.name            }, routedate, function (res) {            });        }        serviceCreatUpdate.updatahor=function (horizdate) {            horizontalpodautoscalers.put({                namespace: namespace,                name: horizdate.metadata.name            }, horizdate, function (data) {            })        }        serviceCreatUpdate.updateDc=function (dc) {            DeploymentConfig.put({                namespace: namespace,                name: dc.metadata.name            }, dc, function (res) {                $state.go('service_detil', {name: dc.metadata.name});            }, function (res) {                toastr.error('参数错误', '更新DC失败')            });        }        return serviceCreatUpdate;    }    function serviceCreatValidate(toastr) {        var serviceCreatValidate = {};        serviceCreatValidate.valid=function (switchs,quota,envs) {            if (switchs.quota) {                if (quota.cpu.request.cpuquota && quota.cpu.limit.cpuquota) {                } else {                    toastr.error('请输入正确的cpu配额', '配额错误')                    return false                }            }            for (var i = 0; i < envs.length; i++) {                if (envs[i].name == '' || envs[i].value == '') {                    toastr.error('请输入正确的环境变量', '环境变量错误')                    return false;                }            }            return true        }        return serviceCreatValidate;    }    function serviceCreatDelete(Cookie, Service, Route, horizontalpodautoscalers) {        var namespace = Cookie.get('namespace');        var serviceCreatDelete = {};        serviceCreatDelete.deleService = function (dc) {            Service.delete({                namespace: namespace,                name: dc.metadata.name            }, function (res) {            })        }        serviceCreatDelete.deleRoute = function (dc) {            Route.delete({                namespace: namespace,                name: dc.metadata.name            }, function (res) {            })        }        serviceCreatDelete.delHor = function (dc) {            horizontalpodautoscalers.delete({                namespace: namespace,                name: dc.metadata.name            }, function (data) {            })        }        return serviceCreatDelete;    }})();