/// <reference path="../lib/index.d.ts" />
import { VNode } from 'ultradom';
declare const h: (tagName: string, properties?: any, children?: string | number | VNode<{}> | (string | number | VNode<{}> | null)[] | null | undefined) => VNode<{}>;
declare function makeRenderLoop<State>(target: HTMLElement, state: State, renderApp: (state: State, affect: Affect, changes: string[]) => VNode, effectHandlers?: EffectDefinition<State>[]): Affect;
export { makeRenderLoop, h };
