/// <reference path="../lib/index.d.ts" />
import { h } from 'picodom';
declare function makeRenderLoop<State>(target: HTMLElement, state: State, renderApp: (state: State, affect: Affect, changes: string[]) => VNode, effectHandlers?: EffectDefinition<State>[]): Affect;
export { makeRenderLoop, h };
