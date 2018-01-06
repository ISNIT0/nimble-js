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
