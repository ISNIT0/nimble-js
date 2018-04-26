"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function effectHandler(done, state, effectHandlers) {
    var affect = function Affect(effects, handler) {
        if (!Array.isArray(effects)) {
            console.log("Triggering effect: ", effects);
            effects = [effects];
        }
        else {
            console.log("Triggering [" + effects.length + "] effects: ", effects);
        }
        // TODO: Pretty dataModRequest logging:
        // data.number   | 1 -> 2
        // data.name     | undefined -> "Joe"
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
