import { has } from './utils';

/**
 * 事件
 */
export interface MutateEvent<K extends string, T extends MutateEventMap<K>> {
    target: MutateEventTarget<T>;
    type: K;
}

/**
 * 事件映射
 */
export type MutateEventMap<T extends string = string> = {
    [K in T]: MutateEvent<any, any>;
};

/**
 * 事件执行器，包括函数和配置
 */
export type EventExecutor<T extends MutateEvent<any, any>> = {
    fn: EventFn<T>;
    option: MutateEventOption;
};

/**
 * 事件监听函数
 */
export type EventFn<T extends MutateEvent<any, any>> = (event: T) => void;

/**
 * 事件列表
 */
export type MutateEventList<T extends MutateEventMap> = {
    [E in keyof T]: EventExecutor<T[E]>[];
};

/**
 * 事件配置
 */
export type MutateEventOption = {};

/**
 * 事件目标，K是所有的事件名称，T是名称对应的事件
 */
export class MutateEventTarget<T extends MutateEventMap<keyof T & string>> {
    /** 所有的事件 */
    private readonly events: MutateEventList<T> = {} as MutateEventList<T>;

    constructor() {}

    /**
     * 添加事件监听器
     */
    on<K extends keyof T>(
        type: K,
        listener: EventFn<T[K]>,
        option: MutateEventOption = {}
    ): void {
        if (!has(this.events[type])) this.events[type] = [];
        this.events[type].push({
            fn: listener,
            option
        });
    }

    /**
     * 移除事件监听器
     */
    off<K extends keyof T>(type: K, listener: EventFn<T[K]>): void {
        const i = this.events[type].findIndex(v => v.fn === listener);
        if (i === -1)
            throw new ReferenceError(
                `You are trying to remove a nonexistent listener.`
            );
        this.events[type].splice(i, 1);
    }

    /**
     * 触发指定类型的事件
     * @returns 是否成功执行了监听
     */
    protected dispatch<K extends keyof T>(
        type: K,
        event: T[K],
        option: MutateEventOption = {}
    ): boolean {
        try {
            for (const { fn, option: opt } of this.events[type]) {
                fn(event);
            }
        } catch (e) {
            throw e;
        }
        return true;
    }
}
