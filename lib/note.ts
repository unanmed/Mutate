import { AnimationBase } from "./animate";
import { Base } from "./base";

export type NoteType = 'tap' | 'hold' | 'drag' | 'flick'

export type DetailRes = 'late' | 'early'

interface NoteConfig {
    /** 音符的打击时间 */
    playTime?: number
    /** perfect判定的时间 */
    perfectTime?: number
    /** good判定的时间 */
    goodTime?: number
}

export class BaseNote<T extends NoteType> extends AnimationBase {
    noteType: T
    noteTime?: number
    played: boolean = false
    /** 该音符所属的基地 */
    base: Base
    /** 音符流速，每帧多少像素 */
    speed: number = 1

    readonly perfectTime: number
    readonly goodTime: number

    constructor(type: T, base: Base, config?: NoteConfig) {
        super();
        this.noteType = type;
        this.noteTime = config?.playTime;
        this.base = base;
        this.perfectTime = config?.perfectTime ?? 50;
        this.goodTime = config?.goodTime ?? 80;
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