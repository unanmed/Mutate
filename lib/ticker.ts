export type TickerFn = () => void

export class Ticker {

    constructor() {

    }

    /**
     * 添加ticker函数
     * @param fn 要添加的函数
     */
    add(fn: TickerFn): Ticker {
        return this;
    }

    /**
     * 去除ticker函数
     * @param fn 要去除的函数
     */
    remove(fn: TickerFn): Ticker {
        return this;
    }

    /**
     * 开始运行这个ticker
     */
    private run(): void {

    }

    /** 
     * 停止运行这个ticker
     */
    private stop(): void {

    }

    /**
     * 摧毁这个ticker
     */
    destroy(): void {

    }
}