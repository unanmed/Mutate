import { has } from './utils';
import { Ticker, TickerFn } from './ticker';
import { TimingFn } from './timing';

type TransitionHook = 'start' | 'end' | 'running';

type TransitionHookFn = (t: Transition) => void;

export class Transition {
    /** 当前值 */
    private now: Record<string, number> = {};
    /** 目标值 */
    private target: Record<string, number> = {};
    /** 钩子 */
    private hooks: Record<TransitionHook, TransitionHookFn[]> = {
        start: [],
        end: [],
        running: []
    };
    /** 正在执行的渐变 */
    private transitionFn: Record<string, TickerFn> = {};

    /** 当前的渐变函数 */
    timing: TimingFn;
    /** 每帧执行的函数 */
    ticker: Ticker = new Ticker();
    /** 相对模式，相对或绝对 */
    relation: 'absolute' | 'relative' = 'absolute';
    /** 渐变时间 */
    easeTime: number = 0;
    /** 目标值 */
    value: Record<string, number>;
    /** 正在渐变的属性 */
    transiting: Record<string, boolean> = {};

    constructor() {
        this.timing = n => n;
        this.value = new Proxy(this.target, {
            set: this.handleSet,
            get: this.handleGet
        });
    }

    /**
     * 设置移动时的动画函数
     * @param fn 动画函数
     */
    mode(fn: TimingFn): Transition {
        this.timing = fn;
        return this;
    }

    /**
     * 设置渐变动画时间
     * @param time 要设置成的时间
     */
    time(time: number): Transition {
        this.easeTime = time;
        return this;
    }

    /**
     * 相对模式
     */
    relative(): Transition {
        this.relation = 'relative';
        return this;
    }

    /**
     * 绝对模式
     */
    absolute(): Transition {
        this.relation = 'absolute';
        return this;
    }

    /**
     * 渐变一个动画属性
     * @param key 渐变的动画属性
     * @param value 渐变至的目标值
     */
    transition(key: string, value: number): Transition {
        if (value === this.target[key]) return this;
        this.target[key] = value;
        if (!has(this.now[key])) {
            this.now[key] = value;
            return this;
        }
        if (this.transiting[key]) this.end(key, true);
        this.transiting[key] = true;
        this.hook('start');

        const start = Date.now();
        const time = this.easeTime;
        const timing = this.timing;
        const from = this.now[key];
        const to = value + (this.relation === 'absolute' ? 0 : from);
        const d = to - from;

        const fn = () => {
            const now = Date.now();
            const delta = now - start;
            if (delta >= time) {
                this.end(key);
            }
            const rate = delta / time;
            this.now[key] = timing(rate) * d + from;
            this.hook('running');
        };
        this.transitionFn[key] = fn;
        this.ticker.add(fn);
        return this;
    }

    /**
     * 等待所有的正在执行的动画操作执行完毕
     */
    async all(): Promise<void> {
        if (Object.values(this.transiting).every(v => v === false)) {
            throw new ReferenceError('There is no transition to be waited.');
        }
        await new Promise(res => {
            const fn = () => {
                if (Object.values(this.transiting).every(v => v === false)) {
                    this.unlisten('end', fn);
                    res('all animated.');
                }
            };
            this.listen('end', fn);
        });
    }

    /**
     * 等待n个正在执行的动画操作执行完毕
     * @param n 要等待的个数
     */
    async n(n: number): Promise<void> {
        const all = Object.values(this.transiting).filter(
            v => v === true
        ).length;
        if (all < n) {
            throw new ReferenceError(
                `You are trying to wait ${n} transition, but there are only ${all} trasition running.`
            );
        }
        let now = 0;
        await new Promise(res => {
            const fn = () => {
                now++;
                if (now === n) {
                    this.unlisten('end', fn);
                    res(`${n} animated.`);
                }
            };
            this.listen('end', fn);
        });
    }

    /**
     * 等待某个种类的渐变执行完毕
     * @param type 要等待的种类
     */
    async w(type: string): Promise<void> {
        if (this.transiting[type] === false) {
            throw new ReferenceError(`The ${type} animate is not transiting.`);
        }
        await new Promise(res => {
            const fn = () => {
                if (this.transiting[type] === false) {
                    this.unlisten('end', fn);
                    res(`${type} animated.`);
                }
            };
            this.listen('end', fn);
        });
    }

    /**
     * 添加一个监听函数
     * @param type 监听类型，start | end | running
     * @param fn 监听函数
     */
    listen(type: TransitionHook, fn: TransitionHookFn): void {
        this.hooks[type].push(fn);
    }

    /**
     * 取消监听
     */
    unlisten(type: TransitionHook, fn: TransitionHookFn): void {
        const index = this.hooks[type].indexOf(fn);
        if (!has(index))
            throw new TypeError(
                'You are trying to remove nonexistent listen function.'
            );
        this.hooks[type].splice(index, 1);
    }

    /**
     * 当值被设置时
     */
    private handleSet = (
        target: Record<string, number>,
        p: string,
        value: number
    ) => {
        this.transition(p, value);
        return true;
    };

    /**
     * 获取值时
     */
    private handleGet = (target: Record<string, number>, p: string) => {
        return this.now[p];
    };

    /**
     * 结束一个渐变
     * @param type 渐变类型
     * @param noset 是否不将属性设置为目标值
     */
    private end(type: string, noset: boolean = false): void {
        const fn = this.transitionFn[type];
        if (!has(fn))
            throw new ReferenceError(
                `You are trying to end an ended transition: ${type}`
            );
        this.ticker.remove(this.transitionFn[type]);
        delete this.transitionFn[type];
        this.transiting[type] = false;
        this.hook('end');
        if (!noset) {
            this.now[type] = this.target[type];
        }
    }

    private hook(type: TransitionHook): void {
        for (const fn of this.hooks[type]) {
            fn(this);
        }
    }
}
