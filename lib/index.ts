///<reference path="./index.d.ts" />

import { h, patch } from 'picodom';
import dataModEffectDefinition from './dataModEffect';
import { bufferWithTime, deepMerge } from './utils';
import effectHandler from './effectHandler';

function makeRenderLoop<State>(
    target: HTMLElement,
    state: State,
    renderApp: (state: State, affect: Affect, changes: string[]) => VNode,
    effectHandlers: EffectDefinition<State>[] = []
): Affect {
    let node: VNode;

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
                    patch(node, $frame, target);
                    node = $frame;
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
    h
};

export { makeRenderLoop, h };

if (window && !(<any>window)['nimble']) {
    (<any>window)['nimble'] = nimble;
}