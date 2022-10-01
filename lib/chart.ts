import { BaseNote, NoteType } from "./note";
import { PathFn } from "./path";
import { TimingFn, TimingGenerator } from "./timing";

export type LevelInfo = BaseNote<NoteType>[]

/**
 * 动画信息
 */
export type AnimateInfo = {
    custom: boolean
    startTime: number
    type: string
    time: number
    mode: {
        fn: string
        args: any[]
    }
}

/**
 * MTT文件的动画
 */
export type MTTAnimate = {
    [time: number]: AnimateInfo
}

/**
 * 摄像机信息
 */
export type MutateCamera = {
    id: string
    animate: MTTAnimate
}

/**
 * 基地信息
 */
export type BaseChart = {
    spawn: number
    id: string
    bpm: {
        [time: number]: number
    }
    animate: MTTAnimate
}

/**
 * 音符信息
 */
export type NoteChart = {
    type: NoteType
    spawn: number
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

/**
 * 读取的谱面信息
 */
export interface MutateChart {
    bases: { [id: string]: BaseChart }
    notes: NoteChart[]
    camera: MutateCamera
}

export type TimingMode = {
    timing: TimingFn
    generator: TimingGenerator
    path: PathFn
}

export type OneAnimate<T extends keyof TimingMode> = {
    type: T
    func: TimingMode[T]
}

export type AnimateDeclare = {
    [key: string]: OneAnimate<keyof TimingMode>
}

export type SpawnEvents = {
    [time: number]: NoteChart
}

export class Chart {
    /** 已注册的动画类型 */
    private readonly animate: AnimateDeclare = {}
    /** 所有的音符 */
    notes: BaseNote<NoteType>[] = []
    spawns: SpawnEvents = {}

    constructor() {

    }

    /**
     * 解析关卡信息
     */
    extract(mtt: MutateChart): LevelInfo {
        return [];
    }

    /**
     * 注册一个新的动画类型，用于谱面解析
     * @param type 动画类型
     * @param func 动画函数
     */
    register<T extends keyof TimingMode>(type: T, func: TimingMode[T]): void {

    }

    /**
     * 渲染所有内容
     */
    render(): void {

    }

    /**
     * 解析并执行音符动画（当然是设置好时间自动运行，不是立即运行
     */
    private executeAnimate(): void {

    }

    /**
     * 设置所有音符和基地的spawn事件
     */
    private spawn(): void {

    }
}