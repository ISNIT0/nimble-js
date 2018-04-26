type Effect = {
    kind: string,
    action?: string,
    keypath?: string,
    arg?: any
};

interface Affect {
    (effects: Effect | Effect[], handler?: (ret: any[]) => void): void,
    set: (kp: string, value: any) => void,
    delete: (kp: string, value?: any) => void,
    push: (kp: string, value: any) => void,
    add: (kp: string, value: any) => void,
}

type EffectDefinition<State> = {
    kind: string,
    handler: (state: State, effect: Effect, affect: Affect) => State | Promise<any> | void
};