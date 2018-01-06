
export function get<T extends any>(obj: any, key: string): T | null {
    if (!obj) return null;
    const dot = '.';
    let word = '';
    let value = obj;

    for (let char of key) {
        if (char != dot) {
            word += char;
        } else {
            value = value[word];
            if (value === undefined || value === null) return <any>value;
            word = '';
        }
    }
    return value[word];
}

export function set<T>(obj: T, path: string, value: any): T {
    var parts = path.split('.');
    var target = <any>obj;
    var last = parts.pop();
    if (!last) {
        console.warn(`Invalid keypath in 'set' [${path}]`);
        return obj;
    }
    while (parts.length) {
        var part = parts.shift();
        if (part) {
            if (!target[part]) target[part] = {};
            target = target[part];
        }
    }
    target[last] = value;
    return obj;
}

export function deepMerge(destination: any, ...sources: any[]) {
    let source: any;
    for (let sI = 0; sI <= sources.length; source = sources[sI++]) {
        for (let property in source) {
            if (source[property] && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                deepMerge(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
    }
    return destination;
}

export function bufferWithTime(func: (...args: any[]) => any, ms: number, handler: (res: any) => void) {
    if (typeof func !== 'function') {
        throw new Error(`[bufferWithTime] Expected a function, but got [${typeof func}]`);
    } else {
        let bufferTimer: number;
        let bufferedArgs: any[] = [];
        return function (...args: any[]) {
            bufferedArgs.push(args);
            if (bufferTimer) {
                clearTimeout(bufferTimer);
            }
            bufferTimer = setTimeout(() => {
                const argsToUse = bufferedArgs.slice();
                bufferedArgs = [];
                handler(func(argsToUse));
            }, ms);
        }
    }
}