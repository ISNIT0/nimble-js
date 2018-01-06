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
