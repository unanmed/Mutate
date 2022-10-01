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