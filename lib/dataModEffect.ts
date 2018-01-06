import { get, set } from './utils';
const dataModEffectDefinition: EffectDefinition<any> = {
    kind: 'dataModRequest',
    handler: (state: any, effect: Effect) => {
        effect.action = effect.action || 'set';
        if (!effect.keypath) {
            console.warn(`Invalid keypath value [${effect.keypath}]`);
            return state;
        }
        if (effect.action === 'custom') {
            let curVal = get<any>(state, effect.keypath);
            effect.arg = effect.arg(curVal);
        } else if (effect.action === 'push') { // We're pushing
            let curVal = get<any>(state, effect.keypath);
            if (!Array.isArray(curVal)) {
                console.warn(`Pushing to non-array ${JSON.stringify(curVal)} - replacing value with empty array`);
                curVal = [];
            }
            effect.arg = curVal.concat(effect.arg);
        } else if (effect.action === 'add') {
            let curVal = get<any>(state, effect.keypath);
            if (!(curVal instanceof Set)) {
                console.warn(`Adding to non-set ${JSON.stringify(curVal)} - replacing value with empty set`);
                curVal = new Set([]);
            }
            effect.arg = curVal.add(effect.arg);
        } else if (effect.action === 'delete') {
            const kpParts = effect.keypath.split('.');
            let deleteKey = kpParts[kpParts.length - 1];
            let newKp = effect.keypath.split('.').slice(0, -1).join('.');
            let curVal = get<any>(state, newKp);

            if (!curVal) return state;

            if (Array.isArray(curVal) && !isNaN(Number(deleteKey))) {
                curVal.splice(Number(deleteKey), 1);
            } else if (curVal[deleteKey] instanceof Set) {
                /*if (curVal[deleteKey].size === 1 || !effect.arg) {
                    delete curVal[deleteKey];
                } else {*/
                curVal[deleteKey].delete(effect.arg);
                curVal = curVal[deleteKey];
                newKp += ('.' + deleteKey);
                /*}*/
            } else {
                delete curVal[deleteKey];
            }

            effect.arg = curVal;
            effect.keypath = newKp;
        }
        return set(state, effect.keypath, effect.arg);
    }
};


export default dataModEffectDefinition;