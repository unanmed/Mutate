import axios from "axios";
import { AnimationBase } from "./animate";
import { Base } from "./base";
import { ToDrawEffect } from "./render";
import { linear } from "./timing";
import { has } from "./utils";

export type NoteType = 'tap' | 'hold' | 'drag'

export type DetailRes = 'late' | 'early'

export interface NoteConfig {
    /** 音符的打击时间 */
    playTime?: number
    /** perfect判定的时间 */
    perfectTime?: number
    /** good判定的时间 */
    goodTime?: number
    /** miss判定的时间 */
    missTime?: number
    /** 长按的时间 */
    time?: number
}

export type NoteShadow = {
    x: number
    y: number
    blur: number
    color: string
}

export type PlayedEffect = {
    perfect: (note: ToDrawEffect) => void
    good: (note: ToDrawEffect) => void
    miss: (note: ToDrawEffect) => void
}

export class BaseNote<T extends NoteType> extends AnimationBase {
    static cnt: number = 0

    /** 是否已经打击过 */
    played: boolean = false
    /** 音符流速，每秒多少像素 */
    speed: number = 500
    /** 不透明度 */
    alpha: number = 1
    /** 滤镜 */
    ctxFilter: string = ''
    /** 阴影 */
    ctxShadow: NoteShadow = {
        x: 0,
        y: 0,
        blur: 0,
        color: ''
    }
    /** 按这个长按的键 */
    key: number = 0
    /** 是否按住 */
    holding: boolean = false
    /** 是否已经被销毁 */
    destroyed: boolean = false
    /** 是完美还是好还是miss */
    res: 'pre' | 'perfect' | 'good' | 'miss' = 'pre'
    /** 是提前还是过晚 */
    detail: DetailRes = 'early'
    /** 上一个音符速度节点 */
    lastNode: number = -1
    /** 上一个速度节点时该音符距离基地的距离 */
    lastD: number = 0
    /** 是否是多压 */
    multi: boolean = false
    /** 绝对横坐标 */
    px: number = 0
    /** 绝对纵坐标 */
    py: number = 0
    /** 第0毫秒的动画是否执行完毕 */
    inited: boolean = false

    /** 音符的专属id */
    readonly num: number = BaseNote.cnt++
    /** 音符种类 */
    readonly noteType: T
    /** 该音符所属的基地 */
    readonly base: Base
    /** 长按时间 */
    readonly holdTime?: number
    /** 打击时间 */
    readonly noteTime?: number
    /** 完美的判定区间 */
    readonly perfectTime: number
    /** 好的判定区间 */
    readonly goodTime: number
    /** miss的判定区间 */
    readonly missTime: number
    /** 速度节点 */
    readonly timeNodes: [number, number][] = []
    /** 音符进入时的方向 */
    dir: [number, number] = [0, 0]
    /** 音符的旋转弧度 */
    rad: number = 0

    constructor(type: T, base: Base, config?: NoteConfig) {
        super();
        this.noteType = type;
        this.noteTime = config?.playTime;
        this.base = base;
        this.perfectTime = config?.perfectTime ?? base.game.perfect;
        this.goodTime = config?.goodTime ?? base.game.good;
        this.missTime = config?.goodTime ?? base.game.miss;
        this.holdTime = config?.time;
        if (has(this.noteTime)) {
            this.dir = this.calDir();
            this.rad = Math.atan(this.dir[1] / this.dir[0]);
        }
        this.register('opacity', 1);
    }

    /**
     * 设置音符流速
     * @param speed 要设置成的音符流速
     */
    setSpeed(speed: number): void {
        this.speed = speed;
    }

    /**
     * 判定该note为完美
     */
    perfect(): void {
        const p = () => {
            this.playSound();
            this.res = 'perfect';
            this.played = true;
            this.destroy();
            this.base.game.renderer.effects.push({
                note: this,
                start: this.base.game.time,
                res: 'perfect',
                end: false
            });
        }

        // 如果是drag的话需要单独判定，要等到drag到了判定点再判定
        const fn = () => {
            if (this.base.game.time >= (this.noteTime as number)) {
                p();
                this.ticker.remove(fn);
            }
        }

        if (this.noteType === 'drag') {
            this.ticker.add(fn);
        } else p();
    }

    /**
     * 判定该note为好
     */
    good(detail: DetailRes): void {
        this.playSound();
        this.res = 'good';
        this.detail = detail;
        this.played = true;
        this.destroy();
        this.base.game.renderer.effects.push({
            note: this,
            start: this.base.game.time,
            res: 'good',
            end: false
        });
    }

    /**
     * 判定该note为miss
     */
    miss(detail: DetailRes): void {
        this.res = 'miss';
        this.detail = detail;
        this.played = true;
        this.destroy();
        this.base.game.renderer.effects.push({
            note: this,
            start: this.base.game.time,
            res: 'miss',
            end: false
        })
    }

    /**
     * 添加打击特效
     */
    pushEffect(data: ToDrawEffect): void {
        const handler = {
            set: (target: ToDrawEffect, key: keyof ToDrawEffect, v: any) => {
                // @ts-ignore
                target[key] = v;
                if (key === 'end') {
                    this.base.game.renderer.effectEnd = true;
                }
                return true;
            }
        }

        const proxy = new Proxy(data, handler);

        this.base.game.renderer.effects.push(proxy);
    }

    /**
     * 按住这个长按
     */
    hold(): void {
        if (this.noteType !== 'hold') throw new TypeError(`You are trying to hold non-hold note.`);
        this.holding = true;
    }

    /**
     * 设置这个note的滤镜
     * @param data 滤镜信息，类型与CanvasRenderingContext2d.filter相同
     */
    filter(data: string): BaseNote<T> {
        this.ctxFilter = data;
        return this;
    }

    /**
     * 设置该音符的不透明度
     * @param num 要设置成的不透明度
     */
    opacity(num: number): BaseNote<T> {
        this.mode(linear())
            .time(1)
            .apply('opacity', num);
        return this;
    }

    /**
     * 设置音符阴影
     */
    shadow(x: number, y: number, blur: number, color: string): BaseNote<T> {
        this.ctxShadow = { x, y, blur, color };
        return this;
    }

    /**
     * 摧毁这个音符
     */
    destroy(): void {
        this.destroyed = true;
    }

    /** 
     * 排序速度节点
     */
    sort(): void {
        this.timeNodes.sort(([a], [b]) => a - b);
    }

    /**
     * 计算音符与基地的距离
     * @returns 音符距离基地中心的距离
     */
    calDistance(): number {
        if (!has(this.noteTime)) return 0;
        this.checkNode();

        return -(this.base.game.time - this.timeNodes[this.lastNode][0]) * this.speed / 1000 + this.lastD;
    }

    /**
     * 计算音符的绝对坐标
     */
    calPosition(): [number, number, number] {
        if (this.destroyed) return [this.px, this.py, NaN];
        const distance = this.calDistance() + this.base.custom.radius;
        if (distance < 0) return [NaN, NaN, NaN];
        const dx = distance * this.dir[0] + this.x,
            dy = distance * this.dir[1] + this.y;
        const x = dx + this.base.x,
            y = dy + this.base.y;

        this.px = x;
        this.py = y;
        return [x, y, distance];
    }

    /**
     * 播放打击音效
     */
    private playSound(): void {
        this.base.game.ac.playSound(this.noteType);
    }

    /**
     * 计算音符进入基地时的方向
     * @returns 音符进入的方向，为[cos, sin]形式
     */
    private calDir(): [number, number] {
        if (!has(this.noteTime)) throw new TypeError(`The note doesn't have noteTime.`);
        const speeds = this.base.timeNodes;
        let res = this.base.initAngle * Math.PI / 180;

        for (let i = 0; i < speeds.length; i++) {
            const [time, speed] = speeds[i];
            const nextTime = speeds[i + 1]?.[0] ?? this.noteTime;
            if (nextTime > this.noteTime) {
                res += (this.noteTime - time) * speed / 30000 * Math.PI;
                break;
            }
            res += (nextTime - time) * speed / 30000 * Math.PI;
        }

        return [Math.cos(res), Math.sin(res)];
    }

    /**
     * 检查速度节点
     */
    private checkNode(): void {
        const now = this.base.game.time;
        let needCal = false;

        // 检查是否需要更新节点
        for (let i = this.lastNode + 1; i < this.timeNodes.length; i++) {
            const [time] = this.timeNodes[i];
            if (time <= now) {
                this.lastNode = i;
                needCal = true;
            }
        }

        // 然后计算位置
        if (needCal) {
            let res = 0;
            for (let i = this.timeNodes.length - 1; i >= this.lastNode; i--) {
                const [time, speed] = this.timeNodes[i];
                const lastTime = this.timeNodes[i + 1]?.[0] ?? this.noteTime;
                res += (lastTime - time) * speed / 1000;
            }
            this.lastD = res;
        }
    }
}