declare module "mutate-game" {
    /**
     * 游戏状态
     */
    export type MutateStatus = 'pre' | 'playing' | 'pause' | 'exit'

    /**
     * 请求类型
     */
    export interface PostType {
        arraybuffer: ArrayBuffer
        json: MutateChart
    }

    /**
     * 结算时的详细信息
     */
    export type MutateDetail = {
        perfect: number
        good: number
        miss: number
        early: number
        late: number
    }

    /**
     * 游戏配置
     */
    export interface MutateOption {
        noteScale?: number
        noteWidth?: number
        perfect?: number
        good?: number
        miss?: number
    }

    /**
     * 系统自带的动画类型
     */
    export type SystemAnimate = 'move' | 'moveAs' | 'rotate' | 'resize'

    /**
     * 谱面文件的数据列表
     */
    export interface ChartDataMap {
        note: NoteChart
        base: BaseChart
        camera: MutateCamera
    }

    /**
     * 解析后的谱面数据
     */
    export interface ChartMap {
        note: BaseNote<NoteType>
        base: Base
        camera: Camera
    }

    /**
     * 谱面文件中的缓动模式
     */
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
        relation: 'absolute' | 'relative'
        first?: boolean
        shake?: boolean
        x?: number
        y?: number
    }

    /**
     * MTT文件的动画
     */
    export type MTTAnimate = AnimateInfo<string>[]

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
        angle: number
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
        filter: {
            [time: number]: string
        }
        shadow: {
            [time: number]: NoteShadow
        }
        opacity: {
            [time: number]: number
        }
        animate: MTTAnimate
    }

    /**
     * 谱面的全局设置
     */
    export type ChartOption = {
        background?: string
    }

    /**
     * 读取的谱面信息
     */
    export interface MutateChart {
        option: ChartOption
        bases: BaseChart[]
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
    } & AnimateInfo<T>

    /**
     * 预执行函数
     */
    export type Executer<T extends keyof ChartDataMap> = (value: any, target: ChartMap[T]) => void

    /**
     * 预执行函数列表
     */
    export type ExecuteDeclare = {
        note: { [key: string]: Executer<'note'> }
        base: { [key: string]: Executer<'base'> }
        camera: { [key: string]: Executer<'camera'> }
    }

    /**
     * 判定结果
     */
    export type JudgeRes = 'perfect' | 'good' | 'miss'

    /**
     * 渲染对象
     */
    export type RenderMap = {
        note: BaseNote<NoteType>
        base: Base
    }

    /**
     * 渲染函数
     */
    export type GameRenderer = {
        base: (e: Base) => void
        tap: (e: BaseNote<'tap'>) => void
        hold: (e: BaseNote<'hold'>) => void
        drag: (e: BaseNote<'drag'>) => void
    }

    /**
     * 打击特效
     * start: 开始时间
     * res: 打击的结果，完美 or 好 or 错过
     * note: 音符实例
     * end: 是否已经结束
     */
    export type ToDrawEffect = {
        start: number
        res: 'perfect' | 'good' | 'miss'
        note: BaseNote<NoteType>
        end: boolean
    }

    /**
     * 不是string的css声明属性
     */
    export type ToOmittedKey = 'getPropertyPriority' | 'length' | 'parentRule'
        | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'

    /**
     * 是string的css属性
     */
    export type CssKey = keyof Omit<CSSStyleDeclaration, ToOmittedKey> & string

    /**
     * 摄像机保存的信息
     */
    export type CameraSaveInfo = {
        x: number
        y: number
        angle: number
        size: number
    }

    /**
     * 动画监听函数
     * @param e 动画实例
     * @param type 执行的动画类型
     */
    export type AnimateFn = (e: AnimationBase, type: AnimateHook | 'all') => void

    /**
     * 动画类型
     */
    export type AnimateType = 'move' | 'rotate' | 'resize' | 'shake'

    /**
     * 动画状态
     */
    export type AnimateTime = 'start' | 'end'

    /**
     * 动画生命周期钩子
     */
    export type AnimateHook = `${AnimateType}${AnimateTime}` | AnimateType | 'animating' | AnimateTime

    /**
     * 渐变函数，输入0-1之间的数，输出一个0-1之间的数，说明了动画完成度，1表示结束，0表示开始
     */
    export type TimingFn = (input: number) => number

    /**
     * in: 慢-快
     * out: 快-慢
     * in-out: 慢-快-慢
     * center: 快-慢-快
     */
    export type EaseMode = 'in' | 'out' | 'in-out' | 'center'

    /**
     * 渐变函数的生成函数
     */
    export type TimingGenerator = (...args: any) => TimingFn

    /**
     * 点
     */
    export type Point = [x: number, y: number]

    /**
     * 路径函数，输入一个0-1的数，输出一个该时刻的位置
     */
    export type PathFn = (input: number) => Point

    /**
     * 路径函数的生成函数
     */
    export type PathG = (...args: any) => PathFn

    /**
     * ticker函数
     * @param time 从这个ticker被创建开始经过的时间，为毫秒数
     */
    export type TickerFn = (time: number) => void

    /**
     * 八种基本类型
     */
    export type BaseType = {
        number: number
        string: string
        object: object
        boolean: boolean
        undefined: undefined
        function: Function
        bigint: bigint
        symbol: symbol
    }

    /**
     * 音符类型
     */
    export type NoteType = 'tap' | 'hold' | 'drag'

    /**
     * 具体的判定结果，提前还是延后
     */
    export type DetailRes = 'late' | 'early'

    /**
     * 音符的配置信息
     */
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

    /**
     * 音符的阴影信息
     */
    export type NoteShadow = {
        x: number
        y: number
        blur: number
        color: string
    }

    /**
     * 音符在不同的判定结果下的打击特效
     */
    export type PlayedEffect = {
        perfect: (note: ToDrawEffect) => void
        good: (note: ToDrawEffect) => void
        miss: (note: ToDrawEffect) => void
    }

    /**
     * 所有的基地
     */
    export const bases: Base[]

    /**
     * 根据id列出的基地
     */
    export const baseMap: { [id: string]: Base }

    /**
     * 游戏核心
     */
    class Mutate {
        /** 音频信息 */
        audio: AudioBuffer
        /** 读取的mtt谱面对象 */
        mtt: MutateChart
        /** 游戏状态 */
        status: MutateStatus
        /** 音乐时间，毫秒数 */
        time: number
        /** 谱面物量 */
        length: number
        /** 是否已经结束游戏 */
        ended: boolean

        /** 是否是移动设备 */
        readonly isMobile: boolean
        /** 游戏渲染目标 */
        readonly target: HTMLCanvasElement
        /** 目标的context */
        readonly ctx: CanvasRenderingContext2D
        /** 核心ticker，用于计算音乐时间等 */
        readonly ticker: Ticker
        /** 音频处理模块 */
        readonly ac: AudioExtractor
        /** 谱面信息 */
        readonly chart: Chart
        /** 渲染器 */
        readonly renderer: Renderer
        /** 游戏宽度 */
        readonly width: number
        /** 游戏高度 */
        readonly height: number
        /** 放缩比例 */
        readonly scale: number
        /** 音符放缩比例 */
        readonly noteScale: number
        /** 音符的长度 */
        readonly noteWidth: number
        /** 音符的绘制比例 */
        readonly drawScale: number
        /** 音符的宽度 */
        readonly drawWidth: number
        /** 音符宽度的一半 */
        readonly halfWidth: number
        /** 音符高度 */
        readonly drawHeight: number
        /** 音符高度的一半 */
        readonly halfHeight: number
        /** 音符的上部宽度 */
        readonly topWidth: number
        /** 音符上宽的一半 */
        readonly halfTopWidth: number
        /** 默认的音符描边样式 */
        readonly multiStroke: CanvasGradient
        /** 完美判定区间 */
        readonly perfect: number
        /** 好的判定区间 */
        readonly good: number
        /** miss的判定区间 */
        readonly miss: number

        constructor(target: HTMLCanvasElement, option?: Partial<MutateOption>)

        /**
         * 加载游戏资源
         * @param music 音乐资源
         * @param mtt 谱面资源
         */
        load(music: string, mtt: string): Promise<void>

        /**
         * 开始游戏
         * @param time 开始时等待的时长，默认为1000ms
         */
        start(time?: number): Promise<void>

        /**
         * 暂停
         */
        pause(): void

        /**
         * 恢复游戏的进行
         */
        resume(): void

        /**
         * 重新开始游戏
         */
        restart(): Promise<void>

        /**
         * 结束本局游戏，取消与canvas的绑定
         */
        end(): void

        /**
         * 设置谱面偏差，正，谱面将会提前，负，谱面将会延后
         */
        setOffset(time: number): void

        /**
         * 获取分数
         */
        getScore(): number

        /**
         * 获取结算的详细信息
         */
        getDetail(): MutateDetail

        /**
         * 设置音符的打击音效
         */
        setSound(type: NoteType, url: string): Promise<void>
    }

    /**
     * 创建一个mutate游戏
     * @param target 目标画布
     */
    export function create(target: HTMLCanvasElement, option?: MutateOption): Mutate

    /**
     * 谱面解析器
     */
    class Chart {
        /** 摄像机实例 */
        camera: Camera
        /** 所有的音符 */
        notes: { [num: number]: BaseNote<NoteType> }
        /** 所有的基地 */
        bases: { [num: number]: Base }
        /** 按id区分的基地 */
        basesDict: { [id: string]: Base }
        /** 剩余的音符数组 */
        notesArr: BaseNote<NoteType>[]
        /** 游戏实例 */
        readonly game: Mutate
        /** 判定模块 */
        readonly judger: Judger

        constructor(mutate: Mutate)

        /**
         * 解析关卡信息
         */
        extract(mtt: MutateChart): Promise<void>

        /**
         * 重新加载并解析谱面，让谱面从头开始
         */
        restart(): Promise<void>

        /**
         * 注册一个新的动画类型，用于谱面解析
         * @param type 动画类型
         * @param name 动画名称
         * @param func 动画函数
         */
        register<T extends keyof TimingMode>(type: T, name: string, func: TimingMode[T]): void

        /**
         * 注册一个预执行函数
         * @param type 注册的类型
         * @param fn 执行的函数
         */
        registerExecute<T extends keyof ExecuteDeclare>(type: T, key: string, fn: Executer<T>): void
    }

    /**
     * 音频处理器
     */
    class AudioExtractor {
        /** 音频信息 */
        audio: AudioBuffer
        /** 音频播放状态 */
        status: MutateStatus
        /** 开始播放时的时间，用于计算音乐时间 */
        startTime: number
        /** 音效的音量 */
        seVolume: number
        /** 音乐的音量 */
        musicVolume: number
        /** 谱面误差 */
        offset: number

        set volume(v: number)

        get volume(): number

        /** 游戏实例 */
        readonly game: Mutate
        /** 音频处理模块 */
        readonly ac: AudioContext
        /** 音效 */
        readonly sounds: { [key: string]: AudioBuffer }
        /** 全局音量控制器 */
        readonly mainGain: GainNode

        constructor(game: Mutate)

        /**
         * 解析ArrayBuffer为音频文件
         */
        extract(buffer: ArrayBuffer): Promise<AudioBuffer>

        /**
         * 播放音频
         */
        play(): void

        /**
         * 暂停播放
         */
        pause(): Promise<void>

        /**
         * 继续播放
         */
        resume(): Promise<void>

        /**
         * 添加音效
         */
        addSound(key: string, buffer: ArrayBuffer): Promise<void>

        /**
         * 播放音效
         */
        playSound(key: string): void

        /**
         * 重新播放音频
         */
        restart(): void
    }

    /**
     * 判定模块
     */
    class Judger {
        /** 下一个或几个需要判定的音符 */
        toJudge: BaseNote<NoteType>[]
        /** 正在按住的长按音符 */
        holding: BaseNote<'hold'>[]
        /** 现在正在按住的键 */
        holdingKeys: number[]
        /** 完美的个数 */
        perfect: number
        /** 好的个数 */
        good: number
        /** miss的个数 */
        miss: number
        /** 最大连击数 */
        maxCombo: number
        /** 提前的个数 */
        early: number
        /** 过晚的个数 */
        late: number
        /** 按住的手指数 */
        touching: number
        /** 自动播放 */
        auto: boolean

        /** 谱面实例 */
        readonly chart: Chart

        set combo(v: number)

        get combo(): number

        constructor(chart: Chart)

        /**
         * 判断一个音符是否在判定区间内
         */
        inJudge(num: number): boolean

        /**
         * 判定音符
         * @param key 记录长按按键的keycode
         */
        judge(key?: number): void

        /**
         * 判定长按
         */
        judgeHold(first: boolean): void
        judgeHold(first: boolean, note: BaseNote<'hold'>, key: number): void

        /**
         * 判定miss drag，以及autoplay
         */
        judgeMissAndDrag(): void

        /**
         * 判断是否多押
         */
        isMulti(note: BaseNote<NoteType>): boolean
    }

    /**
     * 渲染器
     */
    class Renderer {
        /** 当前音乐时间 */
        time: number
        /** 是否有打击特效完成了 */
        effectEnd: boolean
        /** 需要绘制的打击特效 */
        effects: ToDrawEffect[]

        /** 游戏实例 */
        readonly game: Mutate
        /** 渲染器 */
        readonly renderer: GameRenderer
        /** 打击特效 */
        readonly effect: PlayedEffect

        constructor(game: Mutate)

        /**
         * 开始绘制谱面
         */
        start(): void

        /**
         * 渲染所有内容
         */
        render(): void

        /**
         * 设置基地的绘制函数
         */
        setBase(fn: (e: Base) => void): void

        /**
         * 设置音符的绘制函数
         */
        setNote<T extends NoteType>(type: T, fn: (e: BaseNote<T>) => void): void

        /**
         * 设置打击特效
         */
        setEffect(type: 'perfect' | 'good' | 'miss', fn: (e: ToDrawEffect) => void): void

        /**
         * 判断一个物体是否在游戏画面内
         */
        inGame(x: number, y: number, r?: number): boolean
    }

    /**
     * 动画模块
     */
    class AnimationBase {
        /** 渐变函数 */
        timing: TimingFn
        /** 震动变化函数 */
        shakeTiming: TimingFn
        /** 根据路径移动时的路径函数 */
        path: PathFn
        /** 每帧执行函数 */
        ticker: Ticker
        /** 自定义的动画属性 */
        custom: { [key: string]: number }
        /** 变换时的相对模式，相对或绝对 */
        relation: 'relative' | 'absolute'
        /** 渐变时间 */
        easeTime: number
        /** 放缩的大小 */
        size: number
        /** 角度 */
        angle: number

        get x(): number

        get y(): number

        // 无震动时的坐标
        protected ox: number
        protected oy: number

        /** 正在执行的动画 */
        animating: { [x: string]: boolean }

        constructor()

        /**
         * 设置移动时的动画函数
         * @param fn 动画函数
         * @param shake 是否是设置震动的动画
         */
        mode(fn: TimingFn, shake: boolean): AnimationBase

        /**
         * 设置渐变动画时间
         * @param time 要设置成的时间
         */
        time(time: number): AnimationBase

        /**
         * 设置为相对模式
         */
        relative(): AnimationBase

        /**
         * 设置为绝对模式
         */
        absolute(): AnimationBase

        /**
         * 移动
         */
        move(x: number, y: number): AnimationBase

        /**
         * 旋转
         * @param angle 旋转角度，注意不是弧度
         */
        rotate(angle: number): AnimationBase

        /**
         * 缩放
         * @param scale 缩放比例
         */
        scale(scale: number): AnimationBase

        /**
         * 震动
         * @param x 横向震动比例，范围0-1
         * @param y 纵向震动比例，范围0-1
         */
        shake(x: number, y: number): AnimationBase

        /**
         * 根据路径移动
         */
        moveAs(path: PathFn): AnimationBase

        /**
         * 等待所有的正在执行的动画操作执行完毕
         */
        all(): Promise<void>

        /**
         * 等待n个正在执行的动画操作执行完毕
         * @param n 要等待的个数
         */
        n(n: number): Promise<void>

        /**
         * 等待某个种类的动画执行完毕
         * @param type 要等待的种类
         */
        w(type: AnimateType | string): Promise<void>

        /**
         * 监听动画
         * @param type 监听类型
         * @param fn 监听函数，动画执行过程中会执行该函数
         */
        listen(type: AnimateHook, fn: AnimateFn): void

        /**
         * 取消监听
         * @param type 监听类型
         * @param fn 取消监听的函数
         */
        unlisten(type: AnimateHook, fn: AnimateFn): void

        /**
         * 注册一个可用于动画的属性
         * @param key 要注册的属性的名称
         * @param n 初始值
         */
        register(key: string, n: number): void

        /**
         * 执行某个自定义属性的动画
         * @param key 要执行的自定义属性
         * @param n 属性的最终值
         * @param first 是否将动画添加到执行列表的开头
         */
        apply(key: string, n: number, first?: boolean): AnimationBase
    }

    /**
     * 摄像机
     */
    class Camera extends AnimationBase {
        /** 存档栈 */
        saveStack: CameraSaveInfo[]
        /** 第0毫秒的动画是否执行完毕 */
        inited: boolean

        /** 摄像机作用的目标画布 */
        readonly target: CanvasRenderingContext2D
        /** 摄像机id */
        readonly id: string
        /** 游戏实例 */
        readonly game: Mutate

        constructor(game: Mutate, id: string, target: CanvasRenderingContext2D)

        /**
         * 保存摄像机状态
         */
        save(): Camera

        /**
         * 回退摄像机状态
         */
        restore(): Camera

        /**
         * 设置画布的全局特效
         */
        effect(): void

        /**
         * 设置该摄像机的css
         * @param css 要设置成的css内容
         */
        css(css: string): void
    }

    /**
     * 帧函数
     */
    class Ticker {
        /** 所有的ticker函数 */
        funcs: TickerFn[]
        /** 当前ticker的状态 */
        status: 'stop' | 'running'

        constructor()

        /**
         * 添加ticker函数
         * @param fn 要添加的函数
         */
        add(fn: TickerFn, first?: boolean): Ticker

        /**
         * 去除ticker函数
         * @param fn 要去除的函数
         */
        remove(fn: TickerFn): Ticker

        /**
         * 清空这个ticker的所有ticker函数
         */
        clear(): void

        /**
         * 摧毁这个ticker
         */
        destroy(): void
    }

    /**
     * 音符类
     */
    class BaseNote<T extends NoteType> extends AnimationBase {
        static cnt: number

        /** 是否已经打击过 */
        played: boolean
        /** 音符流速，每秒多少像素 */
        speed: number
        /** 不透明度 */
        alpha: number
        /** 滤镜 */
        ctxFilter: string
        /** 阴影 */
        ctxShadow: NoteShadow
        /** 按这个长按的键 */
        key: number
        /** 是否按住 */
        holding: boolean
        /** 是否已经被销毁 */
        destroyed: boolean
        /** 是完美还是好还是miss */
        res: 'pre' | 'perfect' | 'good' | 'miss'
        /** 是提前还是过晚 */
        detail: DetailRes
        /** 上一个音符速度节点 */
        lastNode: number
        /** 上一个速度节点时该音符距离基地的距离 */
        lastD: number
        /** 是否是多压 */
        multi: boolean
        /** 绝对横坐标 */
        px: number
        /** 绝对纵坐标 */
        py: number
        /** 第0毫秒的动画是否执行完毕 */
        inited: boolean

        /** 音符的专属id */
        readonly num: number
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
        readonly timeNodes: [number, number][]
        /** 音符进入时的方向 */
        dir: [number, number]
        /** 音符的旋转弧度 */
        rad: number

        constructor(type: T, base: Base, config?: NoteConfig)

        /**
         * 设置音符流速
         * @param speed 要设置成的音符流速
         */
        setSpeed(speed: number): void

        /**
         * 判定该note为完美
         */
        perfect(): void

        /**
         * 判定该note为好
         */
        good(detail: DetailRes): void

        /**
         * 判定该note为miss
         */
        miss(detail: DetailRes): void

        /**
         * 添加打击特效
         */
        pushEffect(data: ToDrawEffect): void

        /**
         * 按住这个长按
         */
        hold(): void

        /**
         * 设置这个note的滤镜
         * @param data 滤镜信息，类型与CanvasRenderingContext2d.filter相同
         */
        filter(data: string): BaseNote<T>

        /**
         * 设置该音符的不透明度
         * @param num 要设置成的不透明度
         */
        opacity(num: number): BaseNote<T>

        /**
         * 设置音符阴影
         */
        shadow(x: number, y: number, blur: number, color: string): BaseNote<T>

        /**
         * 摧毁这个音符
         */
        destroy(): void

        /** 
         * 排序速度节点
         */
        sort(): void

        /**
         * 计算音符与基地的距离
         * @returns 音符距离基地中心的距离
         */
        calDistance(): number

        /**
         * 计算音符的绝对坐标
         * @returns [x, y, distance]
         */
        calPosition(): [number, number, number]
    }

    class Base extends AnimationBase {
        static cnt: number

        /** 基地旋转速度，一拍一圈 */
        bpm: number
        /** 上一个时间节点 */
        lastNode: number
        /** 上一个时间节点时的角度 */
        lastAngle: number
        /** 当前旋转弧度，不计算动画旋转的角度 */
        rad: number
        /** 第0毫秒的动画是否执行完毕 */
        inited: boolean

        /** 游戏实例 */
        readonly game: Mutate
        /** 在这个基地上的音符 */
        readonly notes: BaseNote<NoteType>[]
        /** 专属id */
        readonly num: number
        /** 字符串id */
        readonly id: string
        /** 速度节点 */
        readonly timeNodes: [number, number][]
        /** 初始角度 */
        readonly initAngle: number

        constructor(id: string, game: Mutate, x: number, y: number, r: number, a: number)

        /**
         * 向该基地添加note
         * @param note 要添加的note
         */
        addNote(note: BaseNote<NoteType>): void

        /** 
         * 排序音符和速度节点
         */
        sort(): void

        /**
         * 设置基地的半径大小
         * @param r 要设置成的半径
         */
        setRadius(r: number): Base

        /**
         * 设置基地颜色
         */
        rgba(r?: number, g?: number, b?: number, a?: number): Base

        /**
         * 设置基地旋转的bpm
         * @param speed 要设置成的bpm
         */
        setSpeed(speed: number): void

        /**
         * 计算旋转的弧度
         */
        calRad(): number
    }

    /**
     * 游戏核心模块
     */
    export namespace core {
        export { Mutate, create }
    }

    /**
     * 谱面模块
     */
    export namespace chart {
        export { Chart }
    }

    /**
     * 音频处理模块
     */
    export namespace audio {
        export { AudioExtractor }
    }

    /**
     * 判定模块
     */
    export namespace judger {
        export { Judger }
    }

    /**
     * 渲染模块
     */
    export namespace render {
        export { Renderer }
    }

    /**
     * 动画模块
     */
    export namespace animate {
        /**
         * 等待指定时长
         * @param time 等待的毫秒数
         */
        export function sleep(time: number): Promise<void>

        export { AnimationBase }
    }

    export namespace ticker {
        export { Ticker }
    }

    /**
     * 摄像机模块
     */
    export namespace camera {
        export { Camera }
    }

    /**
     * 音符模块
     */
    export namespace note {
        export { BaseNote }
    }

    /**
     * 基地模块
     */
    export namespace base {
        export { Base }
    }

    /**
     * 渐变模块
     */
    export namespace timing {
        /**
         * 求积
         * @param m 所有的因数
         */
        export function multi(...m: number[]): number

        /**
         * 求和
         */
        export function add(...n: number[]): number

        /**
         * 求n的阶乘
         */
        export function factorial(n: number): number

        /**
         * 求组合数C_n^m
         */
        export function comNum(m: number, n: number): number

        /**
         * 线性变化
         */
        export function linear(): TimingFn

        /**
         * 贝塞尔曲线变化，起点0，终点1
         * @param cps 所有的控制点纵坐标，数量需要大于等于1，范围0-1
         * @returns 
         */
        export function bezier(...cps: number[]): TimingFn

        /**
         * 三角函数变化
         * @param ease 缓动方式
         */
        export function trigo(mode: 'sin' | 'sec', ease: EaseMode): TimingFn

        /**
         * 幂函数变化
         * @param n 指数
         * @param ease 缓动方式
         */
        export function power(n: number, ease: EaseMode): TimingFn

        /**
         * 双曲函数变化
         */
        export function hyper(mode: 'sin' | 'tan' | 'sec', ease: EaseMode): TimingFn

        /**
         * 反三角函数变化
         */
        export function inverseTrigo(mode: 'sin' | 'tan', ease: EaseMode): TimingFn

        /**
         * 震动变化
         * @param power 最大震动强度，该值越大最大振幅越大
         * @param timing 强度的变化函数，当其返回值为1时表示振幅达到最大值
         * @returns 震动的变化函数
         */
        export function shake(power: number, timing?: TimingFn): TimingFn
    }

    /**
     * 路径模块
     */
    export namespace path {
        /**
         * 圆形轨迹
         * @param r 半径大小
         * @param n 旋转的圈数
         * @param timing 半径变化函数，1表示原长，0表示半径为0
         * @param inverse 是否翻转timing函数
         */
        export function circle(r: number, n?: number, timing?: TimingFn, inverse?: boolean): PathFn

        /**
         * 贝塞尔曲线轨迹
         * @param start 起点
         * @param end 终点
         * @param cps 控制点，是[x, y]数组
         */
        export function bezier(start: Point, end: Point, ...cps: Point[]): PathFn
    }

    /**
     * 工具模块
     */
    export namespace utils {
        /**
         * 判断一个值是否不是null和undefined
         * @param v 要判断的值
         */
        export function has<T>(v: T): v is NonNullable<T>

        /**
         * 判断一个变量是否是某个类型
         * @param v 要判断的值
         * @param type 类型
         */
        export function is<T extends keyof BaseType>(v: any, type: T): v is BaseType[T]

        /**
         * 判断一个值是否是MTT文件的函数类型
         * @param v 要判断的值
         */
        export function isMTTFn(v: any): v is MTTMode<string>

        /**
         * 判断一个函数的返回值是否是某个类型
         * @param fn 要判断的函数
         * @param type 要判断的返回值类型
         * @param test 函数的参数
         * @returns 
         */
        export function isReturnType<T extends keyof BaseType>(fn: (...args: any) => any, type: T, ...test: any[]): fn is (...args: any) => T
    }
}