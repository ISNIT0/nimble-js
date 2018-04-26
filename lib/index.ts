///<reference path="./index.d.ts" />

import { h as uH, render, VNode } from 'ultradom';
import dataModEffectDefinition from './dataModEffect';
import { bufferWithTime, deepMerge, get, set } from './utils';
import effectHandler from './effectHandler';
import makeVirtualHyperscript from './virtualHyperscript';

const h = makeVirtualHyperscript(uH);

function makeRenderLoop<State>(
    target: HTMLElement,
    state: State,
    renderApp: (state: State, affect: Affect, changes: string[]) => VNode,
    effectHandlers: EffectDefinition<State>[] = []
): Affect {
    if(!target) {
        throw new Error(`Please supply a valid target`);
    }
    
    const handlersXKind = deepMerge({}, {
        dataModRequest: dataModEffectDefinition
    },
        effectHandlers.reduce((acc: any, handler) => {
            acc[handler.kind] = handler;
            return acc;
        }, {})
    );

    const bufferedUpdateState = bufferWithTime(
        function updateState(args: any[]) {
            if (args.length) {
                // [[newState, changes], [newState, changes]]
                const changes = args.reduce((acc, val) => acc.concat(val[1]), []);
                const newState = args[args.length - 1][0];
                state = newState;
                const $frame = renderApp(deepMerge({}, state), effectHandler(bufferedUpdateState, state, handlersXKind), changes);
                if ($frame) {
                    render($frame, target);
                } else {
                    // Not yet ready to render
                }
            }
        }, 1, function () {

        }
    );

    bufferedUpdateState(state, []);

    return effectHandler(bufferedUpdateState, state, handlersXKind);
}

const nimble = {
    makeRenderLoop,
    h,
    get,
    set
};

export { makeRenderLoop, h };

if (window && !(<any>window)['nimble']) {
    (<any>window)['nimble'] = nimble;
}