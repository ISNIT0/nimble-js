(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var dataModEffectDefinition = {
    kind: 'dataModRequest',
    handler: function (state, effect) {
        effect.action = effect.action || 'set';
        if (!effect.keypath) {
            console.warn("Invalid keypath value [" + effect.keypath + "]");
            return state;
        }
        if (effect.action === 'custom') {
            var curVal = utils_1.get(state, effect.keypath);
            effect.arg = effect.arg(curVal);
        }
        else if (effect.action === 'push') {
            var curVal = utils_1.get(state, effect.keypath);
            if (!Array.isArray(curVal)) {
                console.warn("Pushing to non-array " + JSON.stringify(curVal) + " - replacing value with empty array");
                curVal = [];
            }
            effect.arg = curVal.concat(effect.arg);
        }
        else if (effect.action === 'add') {
            var curVal = utils_1.get(state, effect.keypath);
            if (!(curVal instanceof Set)) {
                console.warn("Adding to non-set " + JSON.stringify(curVal) + " - replacing value with empty set");
                curVal = new Set([]);
            }
            effect.arg = curVal.add(effect.arg);
        }
        else if (effect.action === 'delete') {
            var kpParts = effect.keypath.split('.');
            var deleteKey = kpParts[kpParts.length - 1];
            var newKp = effect.keypath.split('.').slice(0, -1).join('.');
            var curVal = utils_1.get(state, newKp);
            if (!curVal)
                return state;
            if (Array.isArray(curVal) && !isNaN(Number(deleteKey))) {
                curVal.splice(Number(deleteKey), 1);
            }
            else if (curVal[deleteKey] instanceof Set) {
                /*if (curVal[deleteKey].size === 1 || !effect.arg) {
                    delete curVal[deleteKey];
                } else {*/
                curVal[deleteKey].delete(effect.arg);
                curVal = curVal[deleteKey];
                newKp += ('.' + deleteKey);
                /*}*/
            }
            else {
                delete curVal[deleteKey];
            }
            effect.arg = curVal;
            effect.keypath = newKp;
        }
        return utils_1.set(state, effect.keypath, effect.arg);
    }
};
exports.default = dataModEffectDefinition;

},{"./utils":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function effectHandler(done, state, effectHandlers) {
    var affect = function Affect(effects, handler) {
        if (!Array.isArray(effects)) {
            effects = [effects];
        }
        console.log("Triggering [" + effects.length + "] effects: ", effects);
        var acc = state;
        var dataMods = [];
        var ret = [];
        for (var _i = 0, effects_1 = effects; _i < effects_1.length; _i++) {
            var eff = effects_1[_i];
            var effDefinition = effectHandlers[eff.kind];
            if (!effDefinition) {
                console.warn("Invalid effect kind, could not find [" + eff.kind + "]");
            }
            else {
                if (eff.kind === 'dataModRequest') {
                    if (eff.keypath)
                        dataMods.push(eff.keypath); // Custom type doesn't have a kp
                    var res = effDefinition.handler(acc, eff, affect);
                    if (res && !(res instanceof Promise)) {
                        ret.push(acc = res);
                    }
                    else {
                        console.warn("Expected dataModRequest to return a state value, but instead got [" + res + "]");
                    }
                }
                else {
                    ret.push(effDefinition.handler(acc, eff, affect));
                }
            }
        }
        if (dataMods.length) {
            done(acc, dataMods);
        }
        if (handler) {
            handler(ret);
        }
        console.log("New State:", acc);
    };
    affect.set = function (kp, value) {
        affect({
            kind: 'dataModRequest',
            action: 'set',
            keypath: kp,
            arg: value
        });
    };
    affect.delete = function (kp, value) {
        affect({
            kind: 'dataModRequest',
            action: 'delete',
            keypath: kp,
            arg: value
        });
    };
    affect.push = function (kp, value) {
        affect({
            kind: 'dataModRequest',
            action: 'push',
            keypath: kp,
            arg: value
        });
    };
    affect.add = function (kp, value) {
        affect({
            kind: 'dataModRequest',
            action: 'add',
            keypath: kp,
            arg: value
        });
    };
    return affect;
}
;
exports.default = effectHandler;

},{}],3:[function(require,module,exports){
"use strict";
///<reference path="./index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var picodom_1 = require("picodom");
exports.h = picodom_1.h;
var dataModEffect_1 = require("./dataModEffect");
var utils_1 = require("./utils");
var effectHandler_1 = require("./effectHandler");
function makeRenderLoop(target, state, renderApp, effectHandlers) {
    if (effectHandlers === void 0) { effectHandlers = []; }
    var node;
    var handlersXKind = utils_1.deepMerge({}, {
        dataModRequest: dataModEffect_1.default
    }, effectHandlers.reduce(function (acc, handler) {
        acc[handler.kind] = handler;
        return acc;
    }, {}));
    var bufferedUpdateState = utils_1.bufferWithTime(function updateState(args) {
        if (args.length) {
            // [[newState, changes], [newState, changes]]
            var changes = args.reduce(function (acc, val) { return acc.concat(val[1]); }, []);
            var newState = args[args.length - 1][0];
            state = newState;
            var $frame = renderApp(utils_1.deepMerge({}, state), effectHandler_1.default(bufferedUpdateState, state, handlersXKind), changes);
            if ($frame) {
                picodom_1.patch(node, $frame, target);
                node = $frame;
            }
            else {
                // Not yet ready to render
            }
        }
    }, 1, function () {
    });
    bufferedUpdateState(state, []);
    return effectHandler_1.default(bufferedUpdateState, state, handlersXKind);
}
exports.makeRenderLoop = makeRenderLoop;
var nimble = {
    makeRenderLoop: makeRenderLoop,
    h: picodom_1.h
};
if (window && !window['nimble']) {
    window['nimble'] = nimble;
}

},{"./dataModEffect":1,"./effectHandler":2,"./utils":4,"picodom":5}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function get(obj, key) {
    if (!obj)
        return null;
    var dot = '.';
    var word = '';
    var value = obj;
    for (var _i = 0, key_1 = key; _i < key_1.length; _i++) {
        var char = key_1[_i];
        if (char != dot) {
            word += char;
        }
        else {
            value = value[word];
            if (value === undefined || value === null)
                return value;
            word = '';
        }
    }
    return value[word];
}
exports.get = get;
function set(obj, path, value) {
    var parts = path.split('.');
    var target = obj;
    var last = parts.pop();
    if (!last) {
        console.warn("Invalid keypath in 'set' [" + path + "]");
        return obj;
    }
    while (parts.length) {
        var part = parts.shift();
        if (part) {
            if (!target[part])
                target[part] = {};
            target = target[part];
        }
    }
    target[last] = value;
    return obj;
}
exports.set = set;
function deepMerge(destination) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    var source;
    for (var sI = 0; sI <= sources.length; source = sources[sI++]) {
        for (var property in source) {
            if (source[property] && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                deepMerge(destination[property], source[property]);
            }
            else {
                destination[property] = source[property];
            }
        }
    }
    return destination;
}
exports.deepMerge = deepMerge;
function bufferWithTime(func, ms, handler) {
    if (typeof func !== 'function') {
        throw new Error("[bufferWithTime] Expected a function, but got [" + typeof func + "]");
    }
    else {
        var bufferTimer_1;
        var bufferedArgs_1 = [];
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            bufferedArgs_1.push(args);
            if (bufferTimer_1) {
                clearTimeout(bufferTimer_1);
            }
            bufferTimer_1 = setTimeout(function () {
                var argsToUse = bufferedArgs_1.slice();
                bufferedArgs_1 = [];
                handler(func(argsToUse));
            }, ms);
        };
    }
}
exports.bufferWithTime = bufferWithTime;

},{}],5:[function(require,module,exports){
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports):"function"==typeof define&&define.amd?define(["exports"],r):r(e.picodom={})}(this,function(e){"use strict";function r(e,r){var n,t=[];for(s=arguments.length;s-- >2;)c.push(arguments[s]);for(;c.length;)if(Array.isArray(n=c.pop()))for(s=n.length;s--;)c.push(n[s]);else null!=n&&!0!==n&&!1!==n&&t.push("number"==typeof n?n+="":n);return"string"==typeof e?{type:e,props:r||{},children:t}:e(r||{},t)}function n(e,r,n,t){for(var o=l(n||(n=document.body),n.children[0],e,r);t=a.pop();)t();return o}function t(e,r){var n={};for(var t in e)n[t]=e[t];for(var t in r)n[t]=r[t];return n}function o(e,r){if("string"==typeof e)var n=document.createTextNode(e);else{var n=(r=r||"svg"===e.type)?document.createElementNS("http://www.w3.org/2000/svg",e.type):document.createElement(e.type);e.props&&e.props.oncreate&&a.push(function(){e.props.oncreate(n)});for(var t=0;t<e.children.length;t++)n.appendChild(o(e.children[t],r));for(var t in e.props)p(n,t,e.props[t])}return n}function p(e,r,n,o){if("key"===r);else if("style"===r)for(var r in t(o,n=n||{}))e.style[r]=n[r]||"";else{try{e[r]=n}catch(e){}"function"!=typeof n&&(n?e.setAttribute(r,n):e.removeAttribute(r))}}function i(e,r,n){for(var o in t(r,n)){var i=n[o],f="value"===o||"checked"===o?e[o]:r[o];i!==f&&p(e,o,i,f)}n&&n.onupdate&&a.push(function(){n.onupdate(e,r)})}function f(e,r,n){function t(){e.removeChild(r)}n&&n.onremove&&"function"==typeof(n=n.onremove(r))?n(t):t()}function u(e){if(e&&e.props)return e.props.key}function l(e,r,n,t,p,s){if(null==n)r=e.insertBefore(o(t,p),r);else if(null!=t.type&&t.type===n.type){i(r,n.props,t.props),p=p||"svg"===t.type;for(var c=t.children.length,a=n.children.length,d={},h=[],v={},y=0;y<a;y++){var g=h[y]=r.childNodes[y],m=n.children[y],b=u(m);null!=b&&(d[b]=[g,m])}for(var y=0,k=0;k<c;){var g=h[y],m=n.children[y],w=t.children[k],b=u(m);if(v[b])y++;else{var x=u(w),A=d[x]||[];null==x?(null==b&&(l(r,g,m,w,p),k++),y++):(b===x?(l(r,A[0],A[1],w,p),y++):A[0]?(r.insertBefore(A[0],g),l(r,A[0],A[1],w,p)):l(r,g,null,w,p),k++,v[x]=w)}}for(;y<a;){var m=n.children[y],b=u(m);null==b&&f(r,h[y],m.props),y++}for(var y in d){var A=d[y],B=A[1];v[B.props.key]||f(r,A[0],B.props)}}else r&&t!==r.nodeValue&&("string"==typeof t&&"string"==typeof n?r.nodeValue=t:(r=e.insertBefore(o(t,p),s=r),f(e,s,n.props)));return r}var s,c=[],a=[];e.h=r,e.patch=n});

},{}]},{},[3]);
