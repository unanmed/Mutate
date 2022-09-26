import { NoteType } from "./note";

/**
 * 创建一个mutate游戏
 * @param target 目标画布
 */
export function create(target: HTMLCanvasElement): Mutate {
    return new Mutate(target);
}

export type MutateDetail = {
    perfect: number
    good: number
    miss: number
}

export type AnimateInfo = {
    startTime: number
    type: string
    time: number
    mode: string
    args: number[]
}

export type MTTAnimate = {
    [time: number]: AnimateInfo
}

export type MutateCamera = {
    to: {
        [time: number]: string
    }
    all: {
        [id: string]: {
            id: string
            animate: MTTAnimate
        }
    }
}

export type BaseChart = {
    spwan: number
    id: string
    bpm: {
        [time: number]: number
    }
    animate: MTTAnimate
}

export type NoteChart = {
    type: NoteType
    spwan: number
    speed: {
        [time: number]: number
    }
    animate: MTTAnimate
    filter: {
        [time: number]: string
    }
    shadow: {
        [time: number]: {
            x: number
            y: number
            blur: number
            color: string
        }
    }
    opacity: {
        [time: number]: number
    }
}

export interface MutateChart {
    bases: { [id: string]: BaseChart }
    notes: NoteChart[]
    camera: MutateCamera
}

export class Mutate {
    audio!: AudioBuffer
    mtt!: MutateChart
    target: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    status: 'pre' | 'playing' | 'pause' | 'exit' = 'pre'
    time: number = 0

    constructor(target: HTMLCanvasElement) {
        this.target = target;
        this.ctx = target.getContext('2d') as CanvasRenderingContext2D;
    }

    /**
     * 加载某个音乐
     * @param url 音乐的地址
     */
    async load(url: string): Promise<void> {

    }

    /**
     * 加载某个音乐
     * @param url 谱面的地址
     */
    async loadMTT(url: string): Promise<void> {

    }

    /**
     * 开始游戏
     */
    start(): void {

    }

    /**
     * 暂停
     */
    pause(): void {

    }

    /**
     * 恢复游戏的进行
     */
    resume(): void {

    }

    /**
     * 重新开始游戏
     */
    restart(): void {

    }

    /**
     * 结算本局游戏
     */
    settle(): void {

    }

    /**
     * 退出本局游戏
     */
    exit(): void {

    }

    /**
     * 结束本局游戏，取消与canvas的绑定
     */
    end(): void {

    }

    /**
     * 获取分数
     */
    getScore(): number {
        return 1000000;
    }

    /**
     * 获取结算的详细信息
     */
    getDetail(): MutateDetail {
        return {
            perfect: 0,
            good: 0,
            miss: 0
        }
    }
}