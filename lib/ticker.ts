export type TickerFn = (time?: number) => void

export class Ticker {
    /** 所有的ticker函数 */
    funcs: TickerFn[] = []
    /** 当前ticker的状态 */
    status: 'stop' | 'running' = 'stop'

    constructor() {
        this.run();
    }

    /**
     * 添加ticker函数
     * @param fn 要添加的函数
     */
    add(fn: TickerFn, first: boolean = false): Ticker {
        if (!first) this.funcs.push(fn);
        else this.funcs.unshift(fn);
        return this;
    }

    /**
     * 去除ticker函数
     * @param fn 要去除的函数
     */
    remove(fn: TickerFn): Ticker {
        const index = this.funcs.findIndex(v => v === fn);
        if (index === -1) throw new ReferenceError(`You are going to remove nonexistent ticker function.`);
        this.funcs.splice(index, 1);
        return this;
    }

    /**
     * 清空这个ticker的所有ticker函数
     */
    clear(): void {
        this.funcs = [];
    }

    /**
     * 摧毁这个ticker
     */
    destroy(): void {
        this.clear();
        this.stop();
    }

    /**
     * 每帧执行的函数
     */
    private one(time: number): void {
        for (const fn of this.funcs) {
            try {
                fn(time);
            } catch (e) {
                this.stop();
                throw e;
            }
        }
    }

    /**
     * 开始运行这个ticker
     */
    private run(): void {
        this.status = 'running';
        const fn = (time: number) => {
            if (this.status === 'stop') return;
            this.one(time);
            requestAnimationFrame(fn);
        }
        requestAnimationFrame(fn);
    }

    /** 
     * 停止运行这个ticker
     */
    private stop(): void {
        this.status = 'stop';
    }
}