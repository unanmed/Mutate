import { AnimationBase } from "./animate";
import { Base } from "./base";
import { Camera } from "./camera";
import { Mutate } from "./core";
import { BaseNote, NoteConfig, NoteShadow, NoteType } from "./note";
import { PathFn, PathG } from "./path";
import { TimingFn, TimingGenerator } from "./timing";
import { has, isMTTFn } from "./utils";

export type SystemAnimate = 'move' | 'moveAs' | 'rotate' | 'resize'

export interface ChartDataMap {
    note: NoteChart
    base: BaseChart
    camera: MutateCamera
}

export interface ChartMap {
    note: BaseNote<NoteType>
    base: Base
    camera: Camera
}

export type MTTMode<T extends string> = {
    fnType: keyof TimingMode
    fn: string
    args: any[]
    pathFn: T extends 'moveAs' ? string : void
    pathArg: T extends 'moveAs' ? any[] : void
}

/**
 * 动画信息
 */
export type AnimateInfo<T extends string> = {
    custom: T extends SystemAnimate ? false : true
    start: number
    type: T
    time: number
    n: number
    mode: MTTMode<T>
    relative: 'absolute' | 'relative'
    first?: boolean
    shake?: boolean
    x?: number
    y?: number
}

/**
 * MTT文件的动画
 */
export type MTTAnimate = {
    [time: number]: AnimateInfo<string>
}

/**
 * 摄像机信息
 */
export type MutateCamera = {
    id: string
    animate: MTTAnimate
    css: {
        [time: number]: string
    }
}

/**
 * 基地信息
 */
export type BaseChart = {
    id: string
    x: number
    y: number
    r: {
        [time: number]: number
    }
    bpm: {
        [time: number]: number
    }
    rgba: {
        [time: number]: [number, number, number, number]
    }
    animate: MTTAnimate
}

/**
 * 音符信息
 */
export type NoteChart = {
    base: string
    type: NoteType
    config?: NoteConfig
    speed: {
        [time: number]: number
    }
    animate: MTTAnimate
    filter: {
        [time: number]: string
    }
    shadow: {
        [time: number]: NoteShadow
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

/**
 * 缓动函数
 */
export type TimingMode = {
    timing: TimingFn
    generator: TimingGenerator
    path: PathFn
    pathG: PathG
}

/**
 * 某个特定种类的缓动函数
 */
export type Animates<T extends keyof TimingMode> = {
    [name: string]: TimingMode[T]
}

/**
 * 缓动函数定义
 */
export type AnimateDeclare = {
    [T in keyof TimingMode]: Animates<T>
}

/**
 * 所有的缓动函数
 */
export type TimingAnimateFn = TimingFn | TimingGenerator | PathFn

/**
 * 解析过的单个动画
 */
export type ExtractedMTTAnimate<Path extends boolean, T extends string> = {
    fn: TimingFn
    path: Path extends true ? PathFn : void
    time: number
    start: number
    type: string
    n: number
    custom: T extends SystemAnimate ? false : true
    relation: 'absolute' | 'relative'
    first?: boolean
    shake?: boolean
    x?: number
    y?: number
}

export type Executer<T extends keyof ChartDataMap> = (value: any, target: ChartMap[T]) => void

export type ExecuteDeclare = {
    note: { [key: string]: Executer<'note'> }
    base: { [key: string]: Executer<'base'> }
    camera: { [key: string]: Executer<'camera'> }
}

export class Chart {
    /** 摄像机实例 */
    camera!: Camera
    /** 解析结束后的回调函数 */
    onExtracted: (chart: Chart) => void = () => { }

    /** 所有的音符 */
    readonly notes: { [num: number]: BaseNote<NoteType> } = {}
    /** 所有的基地 */
    readonly bases: { [num: number]: Base } = {}
    /** 按id区分的基地 */
    readonly basesDict: { [id: string]: Base } = {}
    /** 游戏实例 */
    readonly game: Mutate

    /** 已注册的动画类型 */
    private readonly animate: AnimateDeclare = {
        timing: {},
        generator: {},
        path: {},
        pathG: {}
    }

    /** 所有需要预执行的类型 */
    private readonly attrSet: ExecuteDeclare = {
        note: {},
        base: {},
        camera: {}
    }

    constructor(mutate: Mutate) {
        this.game = mutate;
    }

    /**
     * 解析关卡信息
     */
    async extract(mtt: MutateChart): Promise<void> {
        // 主要是创建实例和预执行方法
        const { bases, notes, camera } = mtt;

        await new Promise(res => {
            // 基地
            for (const id in bases) {
                const data = bases[id];
                const base = new Base(id, this.game, data.x, data.y);
                this.bases[base.num] = base;
                this.basesDict[id] = base;
                this.execute('base', data, base);
                this.executeAnimate('base', data.animate, base.num);
            }

            // 音符
            for (const n of notes) {
                const base = this.basesDict[n.base];
                const note = new BaseNote(n.type, base, n.config);
                this.notes[note.num] = note;
                this.execute('note', n, note)
                this.executeAnimate('note', n.animate, note.num);
            }

            // 摄像机
            const c = new Camera(camera.id, this.game.ctx);
            this.camera = c;
            this.executeAnimate('camera', camera.animate);
            this.execute('camera', camera, c);
            res('extract success.');
        });

        this.onExtracted(this);
    }

    /**
     * 注册一个新的动画类型，用于谱面解析
     * @param type 动画类型
     * @param name 动画名称
     * @param func 动画函数
     */
    register<T extends keyof TimingMode>(type: T, name: string, func: TimingMode[T]): void {
        (this.animate[type] as AnimateDeclare[keyof TimingMode])[name] = func;
    }

    /**
     * 注册一个预执行函数
     * @param type 注册的类型
     * @param fn 执行的函数
     */
    registerExecute<T extends keyof ExecuteDeclare>(type: T, key: string, fn: Executer<T>): void {
        (this.attrSet[type] as { [key: string]: Executer<T> })[key] = fn;
    }

    private sortMTT(data: { [time: number]: any }): number[] {
        return Object.keys(data)
            .map(v => parseFloat(v))
            .sort((a, b) => a - b)
    }

    /**
     * 解析MTT文件的动画信息
     * @param data 动画信息
     */
    private extractMTTAnimate<T extends string>(data: AnimateInfo<T>): ExtractedMTTAnimate<T extends 'moveAs' ? true : false, T> {
        // 主要目标是解析函数
        const extract = <T extends keyof TimingMode>(fn: string, type: T, args: any[]): TimingFn | PathFn => {
            const res = args.map(v => {
                // 如果参数是个函数...
                if (isMTTFn(v)) return extract(v.fn, v.fnType, v.args);
                else return v;
            });
            const func = this.animate[type][fn] as TimingMode[T];
            if (type === 'timing') return func as TimingFn;
            // @ts-ignore
            else return func.apply(this, res) as TimingFn | PathFn;
        }
        const fn = extract(data.mode.fn, data.mode.fnType, data.mode.args);
        let path: PathFn | void
        if (data.type === 'moveAs')
            path = extract(data.mode.pathFn as string, 'path', data.mode.pathArg as any[]) as PathFn;
        else path = void 0;

        return {
            // @ts-ignore
            fn,
            // @ts-ignore
            path,
            time: data.time,
            start: data.start,
            type: data.type,
            custom: data.custom,
            n: data.n,
            first: data.first,
            shake: data.shake
        }
    }

    /**
     * 解析并执行音符动画或基地动画（当然是设置好时间自动运行，不是立即运行
     */
    private executeAnimate(target: 'camera', ani: MTTAnimate): void
    private executeAnimate(target: 'note' | 'base', ani: MTTAnimate, num: number): void
    private executeAnimate(target: 'note' | 'base' | 'camera', ani: MTTAnimate, num?: number): void {
        let obj: AnimationBase
        if (target === 'base') obj = this.bases[num as number];
        else if (target === 'note') obj = this.notes[num as number];
        else obj = this.camera;

        const data = this.sortMTT(ani)
            .map(v => this.extractMTTAnimate(ani[v]));

        let last = -1;

        // 每帧执行的函数
        const fn = () => {
            const a = data[last + 1];
            if (!has(a)) return this.game.ticker.remove(fn);
            const time = a.start;
            if (this.game.time < time) return;
            last++;
            obj.mode(a.fn, a.shake)
                .time(a.time)
            if (a.relation === 'absolute') obj.absolute();
            else obj.relative();

            if (a.custom) obj.apply(a.type, a.n, a.first);
            // @ts-ignore
            else if (a.path) obj.moveAs(a.path);
            else if (a.type === 'move') obj.move(a.x as number, a.y as number);
            else if (a.type === 'rotate') obj.rotate(a.n);
            else if (a.type === 'resize') obj.scale(a.n);
            else if (a.type === 'shake') obj.shake(a.x as number, a.y as number);
        }

        this.game.ticker.add(fn);
    }

    /**
     * 执行某个种类的预执行操作
     */
    private execute<T extends keyof ChartDataMap>(type: T, data: ChartDataMap[T], target: ChartMap[T]): void {
        const all = this.attrSet[type];

        const f = (key: keyof ChartDataMap[T]) => {
            let last = -1;
            const d = data[key];
            const sorted = this.sortMTT(d as { [time: number]: any });
            const exe = all[key as string];

            const fn = () => {
                const time = sorted[last + 1];
                if (!has(time)) return this.game.ticker.remove(fn);
                if (this.game.time < time) return;
                last++;
                // @ts-ignore
                exe(data[key][time], target);
            }
            this.game.ticker.add(fn);
        }

        for (const key in all) {
            f(key as keyof ChartDataMap[T]);
        }
    }
}