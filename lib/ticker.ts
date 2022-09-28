export type TickerFn = (time?: number) => void

export class Ticker {
    funcs: TickerFn[] = []
    status: 'stop' | 'running' = 'stop'

    constructor() {
        this.run();
    }

    /**
     * 添加ticker函数
     * @param fn 要添加的函数
     */
    add(fn: TickerFn): Ticker {
        this.funcs.push(fn);
        return this;
    }

    /**
     * 去除ticker函数
     * @param fn 要去除的函数
     */
    remove(fn: TickerFn): Ticker {
        const index = this.funcs.findIndex(v => v === fn);
        if (index === -1) throw new ReferenceError(`You are going to remove nonexistent ticker function.`);
        this.funcs.splice(index);
        return this;
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