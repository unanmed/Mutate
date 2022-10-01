import { MTTMode } from "./chart"

export type BaseType = {
    number: number
    string: string
    object: object
    boolean: boolean
    undefined: undefined
    function: Function
    bigint: bigint
    symbol: symbol
}

/**
 * 判断一个值是否不是null和undefined
 * @param v 要判断的值
 */
export function has<T>(v: T): v is NonNullable<T> {
    return v !== null && v !== void 0;
}

/**
 * 判断一个变量是否是某个类型
 * @param v 要判断的值
 * @param type 类型
 */
export function is<T extends keyof BaseType>(v: any, type: T): v is BaseType[T] {
    return typeof v === type;
}

/**
 * 判断一个值是否是MTT文件的函数类型
 * @param v 要判断的值
 */
export function isMTTFn(v: any): v is MTTMode<string> {
    return has(v) && has(v.fnType) && (v.fnType === 'timing' || v.fnType === 'generator' || v.fnType === 'path');
}

/**
 * 判断一个函数的返回值是否是某个类型
 * @param fn 要判断的函数
 * @param type 要判断的返回值类型
 * @param test 函数的参数
 * @returns 
 */
export function isReturnType<T extends keyof BaseType>(fn: (...args: any) => any, type: T, ...test: any[]): fn is (...args: any) => T {
    return typeof fn(...test) === type;
}