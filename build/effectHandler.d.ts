declare function effectHandler<State>(done: (state: State, changes: string[]) => void, state: State, effectHandlers: {
    [kind: string]: EffectDefinition<State>;
}): Affect;
export default effectHandler;
