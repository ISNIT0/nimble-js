export declare function get<T extends any>(obj: any, key: string): T | null;
export declare function set<T>(obj: T, path: string, value: any): T;
export declare function deepMerge(destination: any, ...sources: any[]): any;
export declare function bufferWithTime(func: (...args: any[]) => any, ms: number, handler: (res: any) => void): (...args: any[]) => void;
