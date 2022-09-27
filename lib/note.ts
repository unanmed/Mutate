import { AnimationBase } from "./animate";
import { Base } from "./base";

export type NoteType = 'tap' | 'hold' | 'drag' | 'flick'

export type DetailRes = 'late' | 'early'

export interface NoteConfig {
    /** 音符的打击时间 */
    playTime?: number
    /** perfect判定的时间 */
    perfectTime?: number
    /** good判定的时间 */
    goodTime?: number
    /** 音符出现时间 */
    spwan?: number
}

export type NoteShadow = {
    x: number
    y: number
    blur: number
    color: string
}

export class BaseNote<T extends NoteType> extends AnimationBase {
    readonly noteType: T
    readonly noteTime?: number
    played: boolean = false
    /** 该音符所属的基地 */
    readonly base: Base
    /** 音符流速，每秒多少像素 */
    speed: number = 500
    /** 生成时间，到时间后才会被绘制或被判定 */
    readonly spwan: number = 0
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

    readonly perfectTime: number
    readonly goodTime: number

    constructor(type: T, base: Base, config?: NoteConfig) {
        super();
        this.noteType = type;
        this.noteTime = config?.playTime;
        this.base = base;
        this.perfectTime = config?.perfectTime ?? 50;
        this.goodTime = config?.goodTime ?? 80;
        if (typeof this.noteTime === 'number') {
            this.spwan = Math.max(this.noteTime - 5000, 0);
        }
        if (typeof config?.spwan === 'number') {
            this.spwan = config.spwan;
        }
    }

    /**
     * 计算音符进入基地时的方向
     * @returns 音符进入的方向，为[cos, sin]形式
     */
    calDir(): [number, number] {
        return [0, 0];
    }

    /**
     * 计算音符的绝对坐标，为应当在的坐标+animate的坐标
     * @returns 音符相对于左上角的位置
     */
    calPosition(): [number, number] {
        return [0, 0];
    }

    /**
     * 设置音符流速
     * @param speed 要设置成的音符流速
     */
    setSpeed(speed: number): BaseNote<T> {
        return this;
    }

    /**
     * 判定该note为完美
     */
    perfect(): BaseNote<T> {
        return this;
    }

    /**
     * 判定该note为好
     */
    good(detail: DetailRes): BaseNote<T> {
        return this;
    }

    /**
     * 判定该note为miss
     */
    miss(detail: DetailRes): BaseNote<T> {
        return this;
    }

    /**
     * 渲染这个note
     * @param target 目标画布
     */
    render(target: CanvasRenderingContext2D): void {
        // To be extended?
    }

    /**
     * 设置这个note的滤镜
     * @param data 滤镜信息，类型与CanvasRenderingContext2d.filter相同
     */
    filter(data: string): BaseNote<T> {
        return this;
    }

    /**
     * 设置该音符的不透明度
     * @param num 要设置成的不透明度
     */
    opacity(num: number): BaseNote<T> {
        return this;
    }

    /**
     * 设置音符阴影
     */
    shadow(x: number, y: number, blur: number, color: string): BaseNote<T> {
        return this;
    }
}