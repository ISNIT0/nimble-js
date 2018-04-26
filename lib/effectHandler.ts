function effectHandler<State>(done: (state: State, changes: string[]) => void, state: State, effectHandlers: { [kind: string]: EffectDefinition<State> }) {
    const affect = <Affect>function Affect(effects: Effect | Effect[], handler?: (ret: any[]) => void) {
        if (!Array.isArray(effects)) {
            console.log(`Triggering effect: `, effects);
            effects = [effects];
        } else {
            console.log(`Triggering [${effects.length}] effects: `, effects);
        }

        // TODO: Pretty dataModRequest logging:
        // data.number   | 1 -> 2
        // data.name     | undefined -> "Joe"

        let acc = state;
        let dataMods = [];
        let ret = [];
        for (let eff of effects) {
            const effDefinition = effectHandlers[eff.kind];
            if (!effDefinition) {
                console.warn(`Invalid effect kind, could not find [${eff.kind}]`);
            } else {
                if (eff.kind === 'dataModRequest') {
                    if (eff.keypath) dataMods.push(eff.keypath); // Custom type doesn't have a kp
                    const res = effDefinition.handler(acc, eff, affect);
                    if (res && !(res instanceof Promise)) {
                        ret.push(acc = res);
                    } else {
                        console.warn(`Expected dataModRequest to return a state value, but instead got [${res}]`);
                    }
                } else {
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
        console.log(`New State:`, acc);
    }

    affect.set = (kp: string, value: any) => {
        affect({
            kind: 'dataModRequest',
            action: 'set',
            keypath: kp,
            arg: value
        });
    }

    affect.delete = (kp: string, value?: any) => {
        affect({
            kind: 'dataModRequest',
            action: 'delete',
            keypath: kp,
            arg: value
        });
    }

    affect.push = (kp: string, value: any) => {
        affect({
            kind: 'dataModRequest',
            action: 'push',
            keypath: kp,
            arg: value
        });
    }

    affect.add = (kp: string, value: any) => {
        affect({
            kind: 'dataModRequest',
            action: 'add',
            keypath: kp,
            arg: value
        });
    }

    return affect;
};

export default effectHandler;