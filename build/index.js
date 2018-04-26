"use strict";
///<reference path="./index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var ultradom_1 = require("ultradom");
var dataModEffect_1 = require("./dataModEffect");
var utils_1 = require("./utils");
exports.get = utils_1.get;
exports.set = utils_1.set;
var effectHandler_1 = require("./effectHandler");
var virtualHyperscript_1 = require("./virtualHyperscript");
var h = virtualHyperscript_1.default(ultradom_1.h);
exports.h = h;
function makeRenderLoop(target, state, renderApp, effectHandlers) {
    if (effectHandlers === void 0) { effectHandlers = []; }
    if (!target) {
        throw new Error("Please supply a valid target");
    }
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
                ultradom_1.render($frame, target);
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
    h: h,
    get: utils_1.get,
    set: utils_1.set
};
if (window && !window['nimble']) {
    window['nimble'] = nimble;
}
