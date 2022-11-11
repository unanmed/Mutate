import { PathFn } from './path';
import { TimingFn } from './timing';
import { cloneDeep } from 'lodash';
import { Ticker, TickerFn } from './ticker';
import { Mutate } from './core';

export type AnimateFn = (e: AnimationBase, type: AnimateHook | 'all') => void;

export type AnimateType = 'move' | 'rotate' | 'resize' | 'shake';

export type AnimateTime = 'start' | 'end';

/**
 * 动画生命周期钩子
 */
export type AnimateHook =
    | `${AnimateType}${AnimateTime}`
    | AnimateType
    | 'animating'
    | AnimateTime;

export interface AnimateTargets {
    system: {
        move: [x: number, y: number];
        moveAs: [x: number, y: number];
        rotate: number;
        resize: number;
        shake: 0;
    };
    custom: Record<string, number>;
}

export interface AnimateTickers {
    system: {
        move: [TickerFn, TickerFn];
        moveAs: TickerFn;
        rotate: TickerFn;
        resize: TickerFn;
        shake: TickerFn;
    };
    custom: Record<string, TickerFn>;
}

const listener = {
    move: [],
    moveend: [],
    movestart: [],
    resize: [],
    resizeend: [],
    resizestart: [],
    rotate: [],
    rotateend: [],
    rotatestart: [],
    shake: [],
    shakeend: [],
    shakestart: [],
    start: [],
    end: [],
    animating: []
};

export async function sleep(time: number) {
    await new Promise(res => setTimeout(res, time));
}

export interface AnimationBaseLike {
    x: number;
    y: number;
    size: number;
    angle: number;
    custom: Record<string, number>;
}

export class AnimationBase {
    /** 渐变函数 */
    timing: TimingFn;
    /** 震动变化函数 */
    shakeTiming: TimingFn;
    /** 根据路径移动时的路径函数 */
    path: PathFn;
    /** 每帧执行函数 */
    ticker: Ticker = new Ticker();
    /** 自定义的动画属性 */
    custom: { [key: string]: number } = {};
    /** 变换时的相对模式，相对或绝对 */
    relation: 'relative' | 'absolute' = 'absolute';
    /** 渐变时间 */
    easeTime: number = 0;
    /** 放缩的大小 */
    size: number = 1;
    /** 角度 */
    angle: number = 0;
    /** mutate游戏实例，使用可选可保证动画可在其它地方使用 */
    game?: Mutate;

    /** 所有的监听函数 */
    private readonly listener: { [T in AnimateHook]: AnimateFn[] } =
        cloneDeep(listener);
    /** 各个动画的目标值 */
    private readonly targetValue: AnimateTargets = {
        system: {
            move: [0, 0],
            moveAs: [0, 0],
            resize: 0,
            rotate: 0,
            shake: 0
        },
        custom: {}
    };
    /** 动画的帧函数 */
    private readonly animateFn: AnimateTickers = {
        system: {
            move: [() => 0, () => 0],
            moveAs: () => 0,
            resize: () => 0,
            rotate: () => 0,
            shake: () => 0
        },
        custom: {}
    };

    get x(): number {
        return this.ox + this.sx;
    }

    get y(): number {
        return this.oy + this.sy;
    }

    // 无震动时的坐标
    protected ox: number = 0;
    protected oy: number = 0;
    // 震动时的坐标
    private sx: number = 0;
    private sy: number = 0;

    /** 正在执行的动画 */
    animating: { [x: string]: boolean } = {};

    constructor(game?: Mutate) {
        this.game = game;
        this.timing = n => n;
        this.shakeTiming = n => n;
        this.path = n => [n, n];
        this.animating = {
            move: false,
            scale: false,
            rotate: false,
            shake: false
        };
        // animating listener
        this.ticker.add(() => {
            const { animating } = this.listener;
            for (const fn of animating) {
                fn(this, 'all');
            }
        });
    }

    /**
     * 设置移动时的动画函数
     * @param fn 动画函数
     */
    mode(fn: TimingFn, shake: boolean = false): AnimationBase {
        if (shake) this.shakeTiming = fn;
        else this.timing = fn;
        return this;
    }

    /**
     * 设置渐变动画时间
     * @param time 要设置成的时间
     */
    time(time: number): AnimationBase {
        this.easeTime = time;
        return this;
    }

    /**
     * 相对模式
     */
    relative(): AnimationBase {
        this.relation = 'relative';
        return this;
    }

    /**
     * 绝对模式
     */
    absolute(): AnimationBase {
        this.relation = 'absolute';
        return this;
    }

    /**
     * 移动
     */
    move(x: number, y: number): AnimationBase {
        if (this.animating.move) this.end(true, 'move');
        this.applySys('ox', x, 'move');
        this.applySys('oy', y, 'move');
        return this;
    }

    /**
     * 旋转
     * @param angle 旋转角度，注意不是弧度
     */
    rotate(angle: number): AnimationBase {
        this.applySys('angle', angle, 'rotate');
        return this;
    }

    /**
     * 缩放
     * @param scale 缩放比例
     */
    scale(scale: number): AnimationBase {
        this.applySys('size', scale, 'resize');
        return this;
    }

    /**
     * 震动
     * @param x 横向震动比例，范围0-1
     * @param y 纵向震动比例，范围0-1
     */
    shake(x: number, y: number): AnimationBase {
        if (this.animating.shake === true) this.end(true, 'shake');

        this.animating.shake = true;
        const { easeTime: time, shakeTiming: timing } = this;
        const start = this.game?.time ?? Date.now();
        this.hook('start', 'shakestart');

        const fn = () => {
            const now = this.game?.time ?? Date.now();
            const delta = now - start;
            if (delta > time) {
                this.ticker.remove(fn);
                this.animating.shake = false;
                this.sx = 0;
                this.sy = 0;
                this.hook('end', 'shakeend');
            }
            const rate = delta / time;
            const p = timing(rate);
            this.sx = p * x;
            this.sy = p * y;
        };
        this.ticker.add(fn);
        this.animateFn.system.shake = fn;
        return this;
    }

    /**
     * 根据路径移动
     */
    moveAs(path: PathFn): AnimationBase {
        // 这个比较独特，要单独处理
        if (this.animating.moveAs) this.end(true, 'moveAs');

        this.animating.moveAs = true;
        this.path = path;
        const { easeTime: time, relation, timing } = this;
        const start = this.game?.time ?? Date.now();
        const [ox, oy] = [this.x, this.y];
        const [tx, ty] = (() => {
            if (relation === 'absolute') return path(1);
            else {
                const [x, y] = path(1);
                return [ox + x, oy + y];
            }
        })();
        this.hook('start', 'movestart');

        const fn = () => {
            const now = this.game?.time ?? Date.now();
            const delta = now - start;
            if (delta > time) {
                this.end(true, 'moveAs');
                return;
            }
            const rate = delta / time;
            const [x, y] = path(timing(rate));
            if (relation === 'absolute') {
                this.ox = x;
                this.oy = y;
            } else {
                this.ox = ox + x;
                this.oy = oy + y;
            }
        };
        this.ticker.add(fn, true);
        this.animateFn.system.moveAs = fn;
        this.targetValue.system.moveAs = [tx, ty];

        return this;
    }

    /**
     * 等待所有的正在执行的动画操作执行完毕
     */
    async all(): Promise<void> {
        if (Object.values(this.animating).every(v => v === false)) {
            return this.error('There is no animates to be waited.');
        }
        await new Promise(res => {
            const fn = () => {
                if (Object.values(this.animating).every(v => v === false)) {
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
        const all = Object.values(this.animating).filter(
            v => v === true
        ).length;
        if (all < n) {
            return this.error(
                `You are trying to wait ${n} animate, but there are only ${all} animate animating.`
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
     * 等待某个种类的动画执行完毕
     * @param type 要等待的种类
     */
    async w(type: AnimateType | string): Promise<void> {
        if (this.animating[type] === false) {
            return this.error(`The ${type} animate is not animating.`);
        }
        await new Promise(res => {
            const fn = () => {
                if (this.animating[type] === false) {
                    this.unlisten('end', fn);
                    res(`${type} animated.`);
                }
            };
            this.listen('end', fn);
        });
    }

    /**
     * 监听动画
     * @param type 监听类型
     * @param fn 监听函数，动画执行过程中会执行该函数
     */
    listen(type: AnimateHook, fn: AnimateFn): void {
        this.listener[type].push(fn);
    }

    /**
     * 取消监听
     * @param type 监听类型
     * @param fn 取消监听的函数
     */
    unlisten(type: AnimateHook, fn: AnimateFn): void {
        const index = this.listener[type].findIndex(v => v === fn);
        if (index === -1)
            return this.error(
                'You are trying to remove a nonexistent listener.'
            );
        this.listener[type].splice(index, 1);
    }

    /**
     * 注册一个可用于动画的属性
     * @param key 要注册的属性的名称
     * @param n 初始值
     */
    register(key: string, n: number): void {
        if (typeof this.custom[key] === 'number') {
            return this.error(
                `Property ${key} has been regietered twice.`,
                'reregister'
            );
        }
        this.custom[key] = n;
        this.animating[key] = false;
    }

    /**
     * 执行某个自定义属性的动画
     * @param key 要执行的自定义属性
     * @param n 属性的最终值
     * @param first 是否将动画添加到执行列表的开头
     */
    apply(key: string, n: number, first: boolean = false): AnimationBase {
        if (this.animating[key] === true) this.end(false, key);
        if (!(key in this.custom))
            this.error(
                `You are trying to execute nonexistent property ${key}.`
            );

        this.animating[key] = true;
        const origin = this.custom[key];
        const start = this.game?.time ?? Date.now();
        const { timing, relation, easeTime: time } = this;
        const d = relation === 'absolute' ? n - origin : n;
        this.hook('start');

        const fn = () => {
            const now = this.game?.time ?? Date.now();
            const delta = now - start;
            if (delta > time) {
                this.end(false, key);
                return;
            }
            const rate = delta / time;
            const per = timing(rate);
            this.custom[key] = origin + per * d;
        };
        this.ticker.add(fn, first);
        this.animateFn.custom[key] = fn;
        this.targetValue.custom[key] = d + origin;

        return this;
    }

    /**
     * 执行系统属性的动画
     * @param key 系统动画id
     * @param n 最终值
     */
    private applySys(
        key: 'ox' | 'oy' | 'angle' | 'size',
        n: number,
        type: AnimateType
    ): void {
        if (type !== 'move' && this.animating[type] === true)
            this.end(true, type);

        this.animating[type] = true;
        const origin = this[key];
        const start = this.game?.time ?? Date.now();
        const timing = this.timing;
        const relation = this.relation;
        const time = this.easeTime;
        const d = relation === 'absolute' ? n - origin : n;
        this.hook('start', `${type}start`);

        // 每帧执行函数
        const fn = () => {
            const now = this.game?.time ?? Date.now();
            const delta = now - start;
            if (delta > time) {
                // 避免move执行多次
                this.end(true, type);
                return;
            }
            const rate = delta / time;
            const per = timing(rate);
            this[key] = origin + d * per;
            if (key !== 'oy') this.hook(type);
        };
        this.ticker.add(fn, true);
        if (key === 'ox') this.animateFn.system.move[0] = fn;
        else if (key === 'oy') this.animateFn.system.move[1] = fn;
        else this.animateFn.system[type as Exclude<AnimateType, 'move'>] = fn;

        if (type === 'move') {
            key === 'ox' && (this.targetValue.system.move[0] = d + origin);
            key === 'oy' && (this.targetValue.system.move[1] = d + origin);
        } else if (type !== 'shake') {
            this.targetValue.system[type] = d + origin;
        }
    }

    /**
     * 报错
     */
    private error(text: string, type?: 'repeat' | 'reregister'): void {
        if (type === 'repeat')
            throw new Error(
                `Cannot execute the same animation twice. Info: ${text}`
            );
        if (type === 'reregister')
            throw new Error(
                `Cannot register a animated property twice. Info: ${text}`
            );
        throw new Error(text);
    }

    /**
     * 执行监听函数
     * @param type 监听类型
     */
    private hook(...type: AnimateHook[]): void {
        const all = Object.entries(this.listener).filter(v =>
            type.includes(v[0] as AnimateHook)
        );
        for (const [type, fns] of all) {
            for (const fn of fns) {
                fn(this, type as AnimateHook);
            }
        }
    }

    /**
     * 结束一个动画
     */
    private end(sys: true, type: keyof AnimateTargets['system']): void;
    private end(sys: false, type: string): void;
    private end(sys: boolean, type: string): void {
        if (sys === true) {
            // 系统动画
            this.animating[type] = false;

            if (type === 'move') {
                this.ticker.remove(this.animateFn.system.move[0]);
                this.ticker.remove(this.animateFn.system.move[1]);
            } else if (type === 'moveAs') {
                this.ticker.remove(this.animateFn.system.moveAs);
            } else {
                this.ticker.remove(
                    this.animateFn.system[
                        type as Exclude<keyof AnimateTargets['system'], 'move'>
                    ]
                );
            }
            if (type === 'move') {
                const [x, y] = this.targetValue.system.move;
                this.ox = x;
                this.oy = y;
                this.hook('moveend', 'end');
            } else if (type === 'moveAs') {
                const [x, y] = this.targetValue.system.moveAs;
                this.ox = x;
                this.oy = y;
                this.hook('moveend', 'end');
            } else if (type === 'rotate') {
                this.angle = this.targetValue.system.rotate;
                this.hook('rotateend', 'end');
            } else if (type === 'resize') {
                this.size = this.targetValue.system.resize;
                this.hook('resizeend', 'end');
            } else {
                this.sx = 0;
                this.sy = 0;
                this.hook('shakeend', 'end');
            }
        } else {
            // 自定义动画
            this.animating[type] = false;
            this.ticker.remove(this.animateFn.custom[type]);
            this.custom[type] = this.targetValue.custom[type];
            this.hook('end');
        }
    }
}
