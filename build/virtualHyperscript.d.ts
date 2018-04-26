import { VNode, h as uH, Children } from 'ultradom';
export declare type UH = typeof uH;
export default function makeVirtualHyperscript(uH: UH): (tagName: string, properties?: any, children?: string | number | VNode<{}> | Children[] | null | undefined) => VNode<{}>;
