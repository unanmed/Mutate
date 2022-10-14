declare module "mutate-game" {
    /**
     * 游戏状态，pre表明游戏还未开始
     * 
     * The status of the game. Status 'pre' indicates the game haven't started.
     */
    export type MutateStatus = 'pre' | 'playing' | 'pause' | 'exit'

    /**
     * 请求类型
     * 
     * The response type of POST
     */
    export interface PostType {
        arraybuffer: ArrayBuffer
        json: MutateChart
    }

    /**
     * 结算时的详细信息
     * 
     * The details at the time of settlement
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
     * 
     * Game initial configuration.
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
     * 
     * built-in animation type.
     */
    export type SystemAnimate = 'move' | 'moveAs' | 'rotate' | 'resize'

    /**
     * 谱面文件的数据列表
     * 
     * Data map of the chart file.
     */
    export interface ChartDataMap {
        note: NoteChart
        base: BaseChart
        camera: MutateCamera
    }

    /**
     * 解析后的谱面数据
     * 
     * The resolved chart data.
     */
    export interface ChartMap {
        note: BaseNote<NoteType>
        base: Base
        camera: Camera
    }

    /**
     * 谱面文件中的缓动模式
     * 
     * Timing mode in the chart file.
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
     * 
     * Animation info.
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
     * 
     * Animations in MTT file.
     */
    export type MTTAnimate = AnimateInfo<string>[]

    /**
     * 摄像机信息
     * 
     * Camera info in MTT file.
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
     * 
     * Base info in MTT file.
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
     * 
     * Note info in MTT file.
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
     * 
     * Global options of the chart.
     */
    export type ChartOption = {
        background?: string
    }

    /**
     * 读取的谱面信息
     * 
     * Chart info in MTT file.
     */
    export interface MutateChart {
        option: ChartOption
        bases: BaseChart[]
        notes: NoteChart[]
        camera: MutateCamera
    }

    /**
     * 缓动函数
     * 
     * Rate function map.
     */
    export type TimingMode = {
        timing: TimingFn
        generator: TimingGenerator
        path: PathFn
        pathG: PathG
    }

    /**
     * 某个特定种类的缓动函数
     * 
     * A particular kind of rate functions.
     */
    export type Animates<T extends keyof TimingMode> = {
        [name: string]: TimingMode[T]
    }

    /**
     * 缓动函数定义
     * 
     * Declaration of the rate functions.
     */
    export type AnimateDeclare = {
        [T in keyof TimingMode]: Animates<T>
    }

    /**
     * 所有的缓动函数
     * 
     * All the rate functions.
     */
    export type TimingAnimateFn = TimingFn | TimingGenerator | PathFn

    /**
     * 解析过的单个动画
     * 
     * Extracted Animation in MTT file.
     */
    export type ExtractedMTTAnimate<Path extends boolean, T extends string> = {
        fn: TimingFn
        path: Path extends true ? PathFn : void
    } & AnimateInfo<T>

    /**
     * 预执行函数
     * 
     * Pre-execution functions.
     */
    export type Executer<T extends keyof ChartDataMap> = (value: any, target: ChartMap[T]) => void

    /**
     * 预执行函数列表
     * 
     * Dict of the pre-execution functions.
     */
    export type ExecuteDeclare = {
        note: { [key: string]: Executer<'note'> }
        base: { [key: string]: Executer<'base'> }
        camera: { [key: string]: Executer<'camera'> }
    }

    /**
     * 判定结果
     * 
     * Result of judgement.
     */
    export type JudgeRes = 'perfect' | 'good' | 'miss'

    /**
     * 渲染对象
     * 
     * The rendering objects.
     */
    export type RenderMap = {
        note: BaseNote<NoteType>
        base: Base
    }

    /**
     * 渲染函数
     * 
     * The rendering functions.
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
     * ---
     * Hitting effects.
     * start: start time.
     * res: the result of the hit, perfect or good or miss.
     * note: note instance.
     * end: whether it has ended.
     */
    export type ToDrawEffect = {
        start: number
        res: 'perfect' | 'good' | 'miss'
        note: BaseNote<NoteType>
        end: boolean
    }

    /**
     * 不是string的css声明属性
     * 
     * The css declaration property that is not a string.
     */
    export type ToOmittedKey = 'getPropertyPriority' | 'length' | 'parentRule'
        | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'

    /**
     * 是string的css属性
     * 
     * The css declaration property that is a string.
     */
    export type CssKey = keyof Omit<CSSStyleDeclaration, ToOmittedKey> & string

    /**
     * 摄像机保存的信息
     * 
     * Save info of the camera.
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
     * 
     * ---
     * 
     * Listener of the animation.
     * @param e 动画实例The instance of AnimationBase.
     * @param type Type the animation executes.
     */
    export type AnimateFn = (e: AnimationBase, type: AnimateHook | 'all') => void

    /**
     * 动画类型
     * 
     * Animation types.
     */
    export type AnimateType = 'move' | 'rotate' | 'resize' | 'shake'

    /**
     * 动画状态
     * 
     * The status of the animation.
     */
    export type AnimateTime = 'start' | 'end'

    /**
     * 动画生命周期钩子
     * 
     * Hooks of the animation.
     */
    export type AnimateHook = `${AnimateType}${AnimateTime}` | AnimateType | 'animating' | AnimateTime

    /**
     * 渐变函数，输入0-1之间的数，输出一个0-1之间的数，说明了动画完成度，1表示结束，0表示开始
     * 
     * Rate function, input a number between 0 and 1, output a number between 0 and 1, 
     * illustrates the degree of animation completion, 1 means the end, and 0 means the beginning.
     */
    export type TimingFn = (input: number) => number

    /**
     * in: 慢-快
     * 
     * out: 快-慢
     * 
     * in-out: 慢-快-慢
     * 
     * center: 快-慢-快
     * 
     * ---
     * in: slow-fast
     * 
     * out: fast-slow
     * 
     * in-out: slow-fast-slow
     * 
     * center: fast-slow-fast
     */
    export type EaseMode = 'in' | 'out' | 'in-out' | 'center'

    /**
     * 渐变函数的生成函数
     * 
     * Generator of the rate functions.
     */
    export type TimingGenerator = (...args: any) => TimingFn

    /**
     * 点
     * 
     * Point.
     */
    export type Point = [x: number, y: number]

    /**
     * 路径函数，输入一个0-1的数，输出一个该时刻的位置
     * 
     * Path function, input a number from 0 to 1, output a position at that moment
     */
    export type PathFn = (input: number) => Point

    /**
     * 路径函数的生成函数
     * 
     * Generator of the path functions.
     */
    export type PathG = (...args: any) => PathFn

    /**
     * ticker函数
     * @param time 从这个ticker被创建开始经过的时间，为毫秒数
     * 
     * ---
     * 
     * Ticker functions.
     * @param time Time passed since this ticker was created, in milliseconds.
     */
    export type TickerFn = (time: number) => void

    /**
     * 八种基本类型
     * 
     * Eight basic types.
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
     * 
     * Note types.
     */
    export type NoteType = 'tap' | 'hold' | 'drag'

    /**
     * 具体的判定结果，提前还是延后
     * 
     * Detail judgement result, early or late.
     */
    export type DetailRes = 'late' | 'early'

    /**
     * 音符的配置信息
     * 
     * Note configuration
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
     * 
     * Shadow infomation of the note.
     */
    export type NoteShadow = {
        x: number
        y: number
        blur: number
        color: string
    }

    /**
     * 音符在不同的判定结果下的打击特效
     * 
     * Hit effects of notes in different judgment results.
     */
    export type PlayedEffect = {
        perfect: (note: ToDrawEffect) => void
        good: (note: ToDrawEffect) => void
        miss: (note: ToDrawEffect) => void
    }

    /**
     * 所有的基地
     * 
     * All the bases.
     */
    const bases: Base[]

    /**
     * 根据id列出的基地
     * 
     * Bases listed by id.
     */
    const baseMap: { [id: string]: Base }

    /**
     * 计分时传递的参数
     * 
     * Parameters passed during scoring.
     */
    export interface ScoreParameters extends MutateDetail {
        length: number
        maxCombo: number
    }

    /**
     * 分数计算函数
     * 
     * Score calculation function.
     */
    export type ScoreCalculator = (e: ScoreParameters) => number

    /**
     * 游戏核心
     * 
     * Core of the game.
     */
    class Mutate {
        /** 
         * 音频信息
         * 
         * Audio buffer of the game.
         */
        audio: AudioBuffer

        /** 
         * 读取的mtt谱面对象
         * 
         * Chart object from MTT file.
         */
        mtt: MutateChart

        /** 
         * 游戏状态
         * 
         * Game status.
         */
        status: MutateStatus

        /** 
         * 音乐时间，毫秒数
         * 
         * Current time of the music, in millisecends.
         */
        time: number

        /** 
         * 谱面物量
         * 
         * Note number of the game. Hitable only.
         */
        length: number

        /** 
         * 是否已经结束游戏
         * 
         * Whether the game has ended.
         */
        ended: boolean


        /** 
         * 是否是移动设备
         * 
         * whether the client is using mobile device or not.
         */
        readonly isMobile: boolean

        /** 
         * 游戏渲染目标
         * 
         * Rendering target of the game.
         */
        readonly target: HTMLCanvasElement

        /** 
         * 目标的context
         * 
         * The context of the target canvas.
         */
        readonly ctx: CanvasRenderingContext2D

        /** 
         * 核心ticker，用于计算音乐时间等
         * 
         * Ticker on the game, for calculating music time, etc.
         */
        readonly ticker: Ticker

        /** 
         * 音频处理模块
         * 
         * Audio processing module.
         */
        readonly ac: AudioExtractor

        /** 
         * 谱面信息
         * 
         * Chart extractor.
         */
        readonly chart: Chart

        /** 
         * 渲染器
         * 
         * Renderer instance.
         */
        readonly renderer: Renderer

        /** 
         * 游戏宽度
         * 
         * Width of the game, in pixels.
         */
        readonly width: number

        /** 
         * 游戏高度
         * 
         * Height of the game, in pixels.
         */
        readonly height: number

        /** 
         * 放缩比例
         * 
         * Scale ratio of the game.
         */
        readonly scale: number

        /** 
         * 音符放缩比例
         * 
         * Scale ratio of the note.
         */
        readonly noteScale: number

        /** 
         * 音符的宽度
         * 
         * Widtn of the note.
         */
        readonly noteWidth: number

        /** 
         * 音符的绘制比例
         * 
         * Scale of the note drawing.
         */
        readonly drawScale: number

        /** 
         * 绘制时音符的宽度
         * 
         * Width of the note in drawing.
         */
        readonly drawWidth: number

        /** 
         * 音符宽度的一半
         * 
         * Half width of the note.
         */
        readonly halfWidth: number

        /** 
         * 绘制时音符高度
         * 
         * Height of the node in drawing.
         */
        readonly drawHeight: number

        /** 
         * 音符高度的一半
         * 
         * Half height of the note.
         */
        readonly halfHeight: number

        /** 
         * 音符的上部宽度
         * 
         * Width of the upper part of the note.
         */
        readonly topWidth: number

        /** 
         * 音符上宽的一半
         * 
         * Half width of the upper part of the note.
         */
        readonly halfTopWidth: number

        /** 
         * 多押的音符描边样式
         * 
         * Multi note stroke style
         */
        readonly multiStroke: CanvasGradient

        /** 
         * 完美判定区间
         * 
         * Perfect judgement interval
         */
        readonly perfect: number

        /** 
         * 好的判定区间
         * 
         * Good judgement interval
         */
        readonly good: number

        /** 
         * miss的判定区间
         * 
         * Miss judgement interval
         */
        readonly miss: number

        constructor(target: HTMLCanvasElement, option?: Partial<MutateOption>)

        /**
         * 加载游戏资源
         * 
         * Load game resources.
         * 
         * @param music 音乐资源地址 | Music resource url.
         * @param mtt 谱面资源地址 | Chart resource url.
         */
        load(music: string, mtt: string): Promise<void>

        /**
         * 开始游戏
         * 
         * Start game.
         * 
         * @param time 开始时等待的时长，默认为1000ms | Duration of the wait at start, default is 1000ms.
         */
        start(time?: number): Promise<void>

        /**
         * 暂停
         * 
         * Pause the game.
         */
        pause(): void

        /**
         * 恢复游戏的进行
         * 
         * Resume the game.
         */
        resume(): void

        /**
         * 重新开始游戏
         * 
         * Restart the game.
         * 
         * @param time 开始时等待的时长，默认为1000ms | Duration of wait, default is 1000ms.
         */
        restart(time?: number): Promise<void>

        /**
         * 结束本局游戏，取消与canvas的绑定
         * 
         * End the game and unbind to the canvas
         */
        end(): void

        /**
         * 设置谱面偏差，正，谱面将会提前，负，谱面将会延后
         * 
         * Set the offset of the chart. If positive, 
         * the chart will be advanced. If negative, the chart will be delayed.
         */
        setOffset(time: number): void

        /**
         * 获取分数
         * 
         * Get the current score of the game.
         */
        getScore(): number

        /**
         * 获取结算的详细信息
         * 
         * Get settlement details. 
         */
        getDetail(): MutateDetail

        /**
         * 设置音符的打击音效
         * 
         * Set the hitting sound of the notes.
         */
        setSound(type: NoteType, url: string): Promise<void>

        /**
         * 设置分数的计算函数
         * 
         * Set the calculation function for the score.
         */
        setScoreCalculator(fn: ScoreCalculator): void
    }

    /**
     * 创建一个mutate游戏
     * 
     * Create a mutate game.
     * 
     * @param target 目标画布 | The target canvas of the game.
     */
    export function create(target: HTMLCanvasElement, option?: MutateOption): Mutate

    /**
     * 谱面解析器
     * 
     * Chart extractor.
     */
    class Chart {
        /** 
         * 摄像机实例
         * 
         * The camera instance.
         */
        camera: Camera

        /** 
         * 所有的音符
         * 
         * All the notes.
         */
        notes: { [num: number]: BaseNote<NoteType> }

        /** 
         * 所有的基地
         * 
         * All the bases.
         */
        bases: { [num: number]: Base }

        /** 
         * 按id区分的基地
         * 
         * All the bases listed by id.
         */
        basesDict: { [id: string]: Base }

        /** 
         * 剩余的音符数组
         * 
         * Array of remaining notes.
         */
        notesArr: BaseNote<NoteType>[]


        /** 
         * 游戏实例
         * 
         * The game instance.
         */
        readonly game: Mutate

        /** 
         * 判定模块
         * 
         * Judgement module.
         */
        readonly judger: Judger

        constructor(mutate: Mutate)

        /**
         * 解析关卡信息
         * 
         * Extract the level information.
         */
        extract(mtt: MutateChart): Promise<void>

        /**
         * 重新加载并解析谱面，让谱面从头开始
         * 
         * Reload and rextract the chart.
         */
        restart(): Promise<void>

        /**
         * 注册一个新的动画类型，用于谱面解析
         * 
         * Register a new animation type for chart extracting.
         * 
         * @param type 动画类型 | Animation type.
         * @param name 动画名称 | The name of the animation.
         * @param func 动画函数 | Animation function.
         */
        register<T extends keyof TimingMode>(type: T, name: string, func: TimingMode[T]): void

        /**
         * 注册一个预执行函数
         * 
         * Register a pre-executed function.
         * 
         * @param type 注册的类型 | The type to function.
         * @param fn 执行的函数 | The function to execute.
         */
        registerExecute<T extends keyof ExecuteDeclare>(type: T, key: string, fn: Executer<T>): void
    }

    /**
     * 音频处理器
     * 
     * Audio Extractor.
     */
    class AudioExtractor {
        /** 
         * 音频信息
         * 
         * Audio buffer of the music.
         */
        audio: AudioBuffer

        /** 
         * 音频播放状态
         * 
         * Audio playback status.
         */
        status: MutateStatus

        /** 
         * 开始播放时的时间，用于计算音乐时间
         * 
         * When does the music started.
         */
        startTime: number

        /** 
         * 音效的音量
         * 
         * Volume of sound effects.
         */
        seVolume: number

        /** 
         * 音乐的音量
         * 
         * Volume of music.
         */
        musicVolume: number

        /** 
         * 谱面误差
         * 
         * Offset of the chart.
         */
        offset: number

        /**
         * 设置音乐的音量
         * 
         * Set the volume of the music
         */
        set volume(v: number)

        /**
         * 获取音乐的音量
         * 
         * Get the volume of the music
         */
        get volume(): number

        /** 
         * 游戏实例
         * 
         * Game instance.
         */
        readonly game: Mutate

        /** 
         * 音频处理模块
         * 
         * Audio context.
         */
        readonly ac: AudioContext

        /** 
         * 音效
         * 
         * Sound effects.
         */
        readonly sounds: { [key: string]: AudioBuffer }

        /** 
         * 全局音量控制器
         * 
         * Golobal gain node.
         */
        readonly mainGain: GainNode

        constructor(game: Mutate)

        /**
         * 解析ArrayBuffer为音频文件
         * 
         * Extract ArrayBuffer into audio AudioBuffer
         */
        extract(buffer: ArrayBuffer): Promise<AudioBuffer>

        /**
         * 播放音频
         * 
         * Play the music.
         */
        play(): void

        /**
         * 暂停播放
         * 
         * Pause the music.
         */
        pause(): Promise<void>

        /**
         * 继续播放
         * 
         * Resume the music
         */
        resume(): Promise<void>

        /**
         * 添加音效
         * 
         * Add a hitting sound effect to a type of note.
         */
        addSound(key: string, buffer: ArrayBuffer): Promise<void>

        /**
         * 播放音效
         * 
         * Play sound effect.
         */
        playSound(key: string): void

        /**
         * 重新播放音频
         * 
         * replay the music.
         */
        restart(): void
    }

    /**
     * 判定模块
     * 
     * Judgement module.
     */
    class Judger {
        /** 
         * 下一个或几个需要判定的音符
         * 
         * The next note or notes to be judged.
         */
        toJudge: BaseNote<NoteType>[]

        /** 
         * 正在按住的长按音符
         * 
         * Holding notes being held down.
         */
        holding: BaseNote<'hold'>[]

        /** 
         * 现在正在按住的键
         * 
         * The key being pressed now.
         */
        holdingKeys: number[]

        /** 
         * 完美的个数
         * 
         * Perfect count.
         */
        perfect: number

        /** 
         * 好的个数
         * 
         * Good count.
         */
        good: number

        /** 
         * miss的个数
         * 
         * Miss count.
         */
        miss: number

        /** 
         * 最大连击数
         * 
         * Max combo.
         */
        maxCombo: number

        /** 
         * 提前的个数
         * 
         * Early count.
         */
        early: number

        /** 
         * 过晚的个数
         * 
         * Late count.
         */
        late: number

        /** 
         * 按住的手指数
         * 
         * touching number.
         */
        touching: number

        /** 
         * 自动播放
         * 
         * Whether autoplay or not.
         */
        auto: boolean

        /** 
         * 谱面实例
         * 
         * Chart instance.
         */
        readonly chart: Chart

        /**
         * 设置当前连击数
         * 
         * Set current combo.
         */
        set combo(v: number)

        /**
         * 获得当前连击数
         * 
         * Get current combo.
         */
        get combo(): number

        constructor(chart: Chart)

        /**
         * 判断一个音符是否在判定数组内
         * 
         * Judge whether a note is in the judgment array.
         */
        inJudge(num: number): boolean

        /**
         * 判定音符
         * 
         * Judge a note.
         * 
         * @param key 记录长按按键的keycode | Key Code of the long press.
         */
        judge(key?: number): void

        /**
         * 判定长按
         * 
         * Judge a hold note.
         */
        judgeHold(first: boolean): void
        judgeHold(first: boolean, note: BaseNote<'hold'>, key: number): void

        /**
         * 判定miss drag，以及autoplay
         * 
         * Judge miss, drag, and autoplay.
         */
        judgeMissAndDrag(): void

        /**
         * 判断是否多押
         * 
         * Judge whether a note is multi-note.
         */
        isMulti(note: BaseNote<NoteType>): boolean
    }

    /**
     * 渲染器
     * 
     * Renderer.
     */
    class Renderer {
        /** 
         * 当前音乐时间
         * 
         * Current time of the music, in miiliseconds.
         */
        time: number

        /** 
         * 是否有打击特效完成了
         * 
         * Whether there are striking effects finished.
         */
        effectEnd: boolean

        /** 
         * 需要绘制的打击特效
         * 
         * Hitting effects to be drawn.
         */
        effects: ToDrawEffect[]

        /** 
         * 游戏实例
         * 
         * Game instance.
         */
        readonly game: Mutate

        /** 
         * 渲染函数
         * 
         * Rendering functions.
         */
        readonly renderer: GameRenderer

        /** 
         * 打击特效函数
         * 
         * Hitting effects functions.
         */
        readonly effect: PlayedEffect

        constructor(game: Mutate)

        /**
         * 开始绘制谱面
         * 
         * Start to draw the chart.
         */
        start(): void

        /**
         * 渲染所有内容
         * 
         * Render all contents.
         */
        render(): void

        /**
         * 设置基地的绘制函数
         * 
         * Set the drawing function of the bases.
         */
        setBase(fn: (e: Base) => void): void

        /**
         * 设置音符的绘制函数
         * 
         * Set the drawing function of the notes.
         */
        setNote<T extends NoteType>(type: T, fn: (e: BaseNote<T>) => void): void

        /**
         * 设置打击特效
         * 
         * Set the hitting effect function.
         */
        setEffect(type: 'perfect' | 'good' | 'miss', fn: (e: ToDrawEffect) => void): void

        /**
         * 判断一个物体是否在游戏画面内
         * 
         * Determine if an object is inside the game screen.
         */
        inGame(x: number, y: number, r?: number): boolean
    }

    /**
     * 动画模块
     * 
     * Animation module.
     */
    class AnimationBase {
        /** 
         * 渐变函数
         * 
         * Rate function.
         */
        timing: TimingFn

        /** 
         * 震动变化函数
         * 
         * Shake function.
         */
        shakeTiming: TimingFn

        /** 
         * 根据路径移动时的路径函数
         * 
         * Path function.
         */
        path: PathFn

        /** 
         * 每帧执行函数
         * 
         * Ticker. Execute function every frame.
         */
        ticker: Ticker

        /** 
         * 自定义的动画属性
         * 
         * Custom animation properties.
         */
        custom: { [key: string]: number }

        /** 
         * 变换时的相对模式，相对或绝对
         * 
         * Relation on animating. Relative or absolute.
         */
        relation: 'relative' | 'absolute'

        /** 
         * 渐变时间
         * 
         * Animating time.
         */
        easeTime: number

        /** 
         * 放缩的大小
         * 
         * Size.
         */
        size: number

        /** 
         * 角度
         * 
         * Angle.
         */
        angle: number

        /**
         * 横坐标
         * 
         * Horizontal coordinate.
         */
        get x(): number


        /**
         * 纵坐标
         * 
         * Vertical coordinate.
         */
        get y(): number

        protected ox: number
        protected oy: number

        /** 
         * 正在执行的动画
         * 
         * Animation being executed.
         */
        animating: { [x: string]: boolean }

        constructor()

        /**
         * 设置动画时的动画函数
         * 
         * Set the rate function when animating.
         * 
         * @param fn 缓动函数 | rate function.
         * @param shake 是否是设置震动的动画 | Whether it is to set the animation of vibration.
         */
        mode(fn: TimingFn, shake: boolean): AnimationBase

        /**
         * 设置渐变动画时间
         * 
         * Set the animation time.
         * 
         * @param time 要设置成的时间 | The time to be set to.
         */
        time(time: number): AnimationBase

        /**
         * 设置为相对模式
         * 
         * Set to relative mode.
         */
        relative(): AnimationBase

        /**
         * 设置为绝对模式
         * 
         * Set to absolute mode.
         */
        absolute(): AnimationBase

        /**
         * 移动
         * 
         * Move.
         */
        move(x: number, y: number): AnimationBase

        /**
         * 旋转
         * 
         * Rotate.
         * 
         * @param angle 旋转角度 | Rotation angle.
         */
        rotate(angle: number): AnimationBase

        /**
         * 缩放
         * 
         * Scale.
         * 
         * @param scale 缩放比例 | Scale size.
         */
        scale(scale: number): AnimationBase

        /**
         * 震动
         * 
         * Shake.
         * 
         * @param x 横向震动比例，范围0-1 | Horizontal vibration ratio, between 0 and 1.
         * @param y 纵向震动比例，范围0-1 | Vertical vibration ratio, between 0 and 1.
         */
        shake(x: number, y: number): AnimationBase

        /**
         * 根据路径移动
         * 
         * Move by path.
         */
        moveAs(path: PathFn): AnimationBase

        /**
         * 等待所有的正在执行的动画操作执行完毕
         * 
         * Wait for all the animation being executed to finish.
         */
        all(): Promise<void>

        /**
         * 等待n个正在执行的动画操作执行完毕
         * 
         * Wait for the n executing animations to finish.
         * 
         * @param n 要等待的个数 | Number of animations to wait.
         */
        n(n: number): Promise<void>

        /**
         * 等待某个种类的动画执行完毕
         * 
         * Wait for a certain kind of animation to finish executing.
         * 
         * @param type 要等待的种类 | Types to wait for.
         */
        w(type: AnimateType | string): Promise<void>

        /**
         * 监听动画
         * 
         * Listen animations
         * 
         * @param type 监听类型 | The type to be listened.
         * @param fn 监听函数，动画执行过程中会执行该函数 | Listening function, which will be executed during the animation execution.
         */
        listen(type: AnimateHook, fn: AnimateFn): void

        /**
         * 取消监听
         * 
         * unlisten animations.
         * 
         * @param type 监听类型 | The type to be unlistened.
         * @param fn 取消监听的函数 | The function to be deleted.
         */
        unlisten(type: AnimateHook, fn: AnimateFn): void

        /**
         * 注册一个可用于动画的属性
         * 
         * Register a property that can be used for animation.
         * 
         * @param key 要注册的属性的名称 | Name of the property to be registered.
         * @param n 初始值 | Initial value.
         */
        register(key: string, n: number): void

        /**
         * 执行某个自定义属性的动画 
         * 
         * Execute the animation of a custom property.
         * 
         * @param key 要执行的自定义属性 | Custom properties to be executed.
         * @param n 属性的目标值 | Target value.
         * @param first 是否将动画添加到执行列表的开头 | Whether to add the animation to the beginning of the execution list.
         */
        apply(key: string, n: number, first?: boolean): AnimationBase
    }

    /**
     * 摄像机
     * 
     * Camera.
     */
    class Camera extends AnimationBase {
        /** 
         * 存档栈
         * 
         * Save stack.
         */
        saveStack: CameraSaveInfo[]
        /** 
         * 第0毫秒的动画是否执行完毕
         * 
         * Whether the animation of the 0th millisecond is executed or not.
         */
        inited: boolean

        /** 
         * 全局效果函数
         * 
         * Global effect functions.
         */
        effectFn: (camera: Camera) => void

        /** 
         * 摄像机作用的目标画布
         * 
         * The target canvas context of the camera.
         */
        readonly target: CanvasRenderingContext2D

        /** 
         * 摄像机id
         * 
         * Camera's id.
         */
        readonly id: string

        /** 
         * 游戏实例
         * 
         * Game instance.
         */
        readonly game: Mutate

        constructor(game: Mutate, id: string, target: CanvasRenderingContext2D)

        /**
         * 保存摄像机状态
         * 
         * Save camera status.
         */
        save(): Camera

        /**
         * 回退摄像机状态
         * 
         * Rewind camera status.
         */
        restore(): Camera

        /**
         * 执行全局效果函数
         * 
         * Execute global effect functions.
         */
        effect(): void

        /**
         * 设置该摄像机的css
         * 
         * Set the css of this camera
         * 
         * @param css 要设置成的css内容 | CSS to be set to.
         */
        css(css: string): void

        /**
         * 设置全局效果
         * 
         * Set global effects
         * 
         * @param fn 效果函数，传入一个摄像机实例参数 | effect function, passing in a camera instance parameter.
         */
        setGlobalEffects(fn: (camera: Camera) => void): void
    }

    /**
     * 帧函数
     * 
     * Ticker
     */
    class Ticker {
        /** 
         * 所有的ticker函数
         * 
         * All ticker functions.
         */
        funcs: TickerFn[]

        /** 
         * 当前ticker的状态
         * 
         * Current status of the ticker.
         */
        status: 'stop' | 'running'

        constructor()

        /**
         * 添加ticker函数
         * 
         * Add a ticker function.
         * 
         * @param fn 要添加的函数 | The function to be set.
         */
        add(fn: TickerFn, first?: boolean): Ticker

        /**
         * 去除ticker函数
         * 
         * Remove a ticker function.
         * 
         * @param fn 要去除的函数 | The function to be removed.
         */
        remove(fn: TickerFn): Ticker

        /**
         * 清空这个ticker的所有ticker函数
         * 
         * Clear all the ticker functions.
         */
        clear(): void

        /**
         * 摧毁这个ticker
         * 
         * Destroy the ticker.
         */
        destroy(): void
    }

    /**
     * 音符类
     * 
     * Note.
     */
    class BaseNote<T extends NoteType> extends AnimationBase {
        static cnt: number

        /** 
         * 是否已经打击过
         * 
         * Whether the note has been hit.
         */
        played: boolean

        /** 
         * 音符流速，每秒多少像素
         * 
         * Note flow rate, in pixels per second.
         */
        speed: number

        /** 
         * 不透明度
         * 
         * Opacity.
         */
        alpha: number

        /** 
         * 滤镜
         * 
         * Filter.
         */
        ctxFilter: string

        /** 
         * 阴影
         * 
         * Shadow.
         */
        ctxShadow: NoteShadow

        /** 
         * 按这个长按的键
         * 
         * Key of the hold note.
         */
        key: number

        /** 
         * 是否按住
         * 
         * Whether the note is being held.
         */
        holding: boolean

        /** 
         * 是否已经被销毁
         * 
         * Whether the note has been destroyed.
         */
        destroyed: boolean

        /** 
         * 是完美还是好还是miss
         * 
         * Perfect or good or miss or before hitting.
         */
        res: 'pre' | 'perfect' | 'good' | 'miss'

        /** 
         * 是提前还是过晚
         * 
         * Late or early.
         */
        detail: DetailRes

        /** 
         * 上一个音符速度节点
         * 
         * Last note flow speed node.
         */
        lastNode: number

        /** 
         * 上一个速度节点时该音符距离基地的距离
         * 
         * Distance of this note from the base at the last flow speed node.
         */
        lastD: number

        /** 
         * 是否是多压
         * 
         * Whether the note is multi-note or not.
         */
        multi: boolean

        /** 
         * 绝对横坐标
         * 
         * Absolute horizontal coordinate.
         */
        px: number

        /** 
         * 绝对纵坐标
         * 
         * Absolute vertical coordinate.
         */
        py: number

        /** 
         * 第0毫秒的动画是否执行完毕
         * 
         * Whether the animation of the 0th millisecond is executed or not.
         */
        inited: boolean

        /** 
         * 音符进入时的方向
         * 
         * The direction of the note.
         */
        dir: [number, number]

        /** 
         * 音符的旋转弧度
         * 
         * The rotation arc of the note.
         */
        rad: number

        /** 
         * 音符的专属id
         * 
         * Id of the note.
         */
        readonly num: number

        /** 
         * 音符种类
         * 
         * The type of the note.
         */
        readonly noteType: T

        /** 
         * 该音符所属的基地
         * 
         * The base the note belongs to.
         */
        readonly base: Base

        /** 
         * 长按时间
         * 
         * The time to hold, if the note is a hold note.
         */
        readonly holdTime?: number

        /** 
         * 打击时间
         * 
         * When the note should be hit.
         */
        readonly noteTime?: number

        /** 
         * 完美的判定区间
         * 
         * Perfect judgement interval.
         */
        readonly perfectTime: number

        /** 
         * 好的判定区间
         * 
         * Good judgement interval.
         */
        readonly goodTime: number

        /** 
         * miss的判定区间
         * 
         * Miss judgement interval.
         */
        readonly missTime: number

        /** 
         * 速度节点
         * 
         * Flow speed nodes.
         */
        readonly timeNodes: [number, number][]



        constructor(type: T, base: Base, config?: NoteConfig)

        /**
         * 设置音符流速
         * 
         * Set note flow Speed.
         * 
         * @param speed 要设置成的音符流速 | Speed to be set to.
         */
        setSpeed(speed: number): void

        /**
         * 判定该note为完美
         * 
         * Judge the note as perfect.
         */
        perfect(): void

        /**
         * 判定该note为好
         * 
         * Judge the note as good.
         */
        good(detail: DetailRes): void

        /**
         * 判定该note为miss
         * 
         * Judge the note as miss.
         */
        miss(detail: DetailRes): void

        /**
         * 添加打击特效
         * 
         * Add a hitting effect.
         */
        pushEffect(data: ToDrawEffect): void

        /**
         * 按住这个长按
         * 
         * Hold this long hold note, if it is.
         */
        hold(): void

        /**
         * 设置这个note的滤镜
         * 
         * Set the filter of the note.
         * 
         * @param data 滤镜信息，类型与CanvasRenderingContext2d.filter相同 | Filter to be set to.
         */
        filter(data: string): BaseNote<T>

        /**
         * 设置该音符的不透明度
         * 
         * Set the opacity of the note.
         * 
         * @param num 要设置成的不透明度 | Opacity to be set to.
         */
        opacity(num: number): BaseNote<T>

        /**
         * 设置音符阴影
         * 
         * Set the shadow of the shadow.
         */
        shadow(x: number, y: number, blur: number, color: string): BaseNote<T>

        /**
         * 摧毁这个音符
         * 
         * Destroy this note.
         */
        destroy(): void

        /** 
         * 排序速度节点
         * 
         * Sort the flow speed nodes.
         */
        sort(): void

        /**
         * 计算音符与基地的距离
         * 
         * Calculate the distance between the note and the base.
         * 
         * @returns 音符距离基地中心的距离 | Distance of the note from the center of the base .
         */
        calDistance(): number

        /**
         * 计算音符的绝对坐标
         * 
         * Calculate the absolute coordinates of the note.
         * 
         * @returns [x, y, distance]
         */
        calPosition(): [number, number, number]
    }

    /**
     * 基地
     * 
     * Base.
     */
    class Base extends AnimationBase {
        static cnt: number

        /** 
         * 基地旋转速度，一拍一圈
         * 
         * Base rotation speed, half loop per beat.
         */
        bpm: number

        /** 
         * 上一个时间节点
         * 
         * Last time node.
         */
        lastNode: number

        /** 
         * 上一个时间节点时的角度
         * 
         * The angle at the last time node.
         */
        lastAngle: number

        /** 
         * 当前旋转弧度，不计算动画旋转的角度
         * 
         * Current rotation arc, without the angle of animation rotation.
         */
        rad: number

        /**
         * 第0毫秒的动画是否执行完毕
         * 
         * Whether the animation of the 0th millisecond is executed or not.
         */
        inited: boolean

        /** 
         * 游戏实例
         * 
         * Game instance.
         */
        readonly game: Mutate

        /** 
         * 在这个基地上的音符
         * 
         * Notes in this base.
         */
        readonly notes: BaseNote<NoteType>[]

        /** 
         * 专属id
         * 
         * Number id of the base.
         */
        readonly num: number

        /** 
         * 字符串id
         * 
         * String id of the base.
         */
        readonly id: string

        /** 
         * 速度节点
         * 
         * Rotation speed nodes.
         */
        readonly timeNodes: [number, number][]

        /** 
         * 初始角度
         * 
         * Initial angle.
         */
        readonly initAngle: number

        constructor(id: string, game: Mutate, x: number, y: number, r: number, a: number)

        /**
         * 向该基地添加note
         * 
         * Add note to the base.
         * 
         * @param note 要添加的note | Note to be added.
         */
        addNote(note: BaseNote<NoteType>): void

        /** 
         * 排序音符和速度节点
         * 
         * Sort the note and the rotation speed node.
         */
        sort(): void

        /**
         * 设置基地的半径大小
         * 
         * Set the radius of the base.
         * 
         * @param r 要设置成的半径 | Radius to be set to.
         */
        setRadius(r: number): Base

        /**
         * 设置基地颜色
         * 
         * Set the color of the base.
         */
        rgba(r?: number, g?: number, b?: number, a?: number): Base

        /**
         * 设置基地旋转的bpm
         * 
         * Set the rotation speed of the base.
         * 
         * @param speed 要设置成的bpm | bpm to be set to.
         */
        setSpeed(speed: number): void

        /**
         * 计算旋转的弧度
         * 
         * Calculate the radian of rotation.
         */
        calRad(): number
    }

    /**
     * 游戏核心模块
     * 
     * Core module of the game.
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
         * 
         * Waiting for a specified length of time
         * 
         * @param time 等待的毫秒数 | milliseconds to be waited for.
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
        export { Base, bases, baseMap }
    }

    /**
     * 渐变模块
     */
    export namespace timing {
        /**
         * 求积
         * 
         * Multiply.
         * 
         * @param m 所有的因数 | All multipliers.
         */
        export function multi(...m: number[]): number

        /**
         * 求和
         * 
         * Summation
         */
        export function add(...n: number[]): number

        /**
         * 求n的阶乘
         * 
         * Find the factorial of n.
         */
        export function factorial(n: number): number

        /**
         * 求组合数C_n^m
         * 
         * Find the number of combinations C_n^m
         */
        export function comNum(m: number, n: number): number

        /**
         * 线性变化
         * 
         * Linear rate function.
         */
        export function linear(): TimingFn

        /**
         * 贝塞尔曲线变化，起点0，终点1
         * 
         * Bezier curve rate function, starting at 0, ending at 1.
         * 
         * @param cps 所有的控制点纵坐标，数量需要大于等于1，范围0-1 | All control point vertical coordinates, 
         * the number needs to be greater than or equal to 1, between 0 and 1.
         */
        export function bezier(...cps: number[]): TimingFn

        /**
         * 三角函数变化
         * 
         * Trigonometric rate function.
         * 
         * @param ease 缓动方式 | Easing mode.
         */
        export function trigo(mode: 'sin' | 'sec', ease: EaseMode): TimingFn

        /**
         * 幂函数变化
         * 
         * Power rate function.
         * 
         * @param n 指数 | Exponential.
         * @param ease 缓动方式 | Easing mode.
         */
        export function power(n: number, ease: EaseMode): TimingFn

        /**
         * 双曲函数变化
         * 
         * Hyperbolic rate function.
         */
        export function hyper(mode: 'sin' | 'tan' | 'sec', ease: EaseMode): TimingFn

        /**
         * 反三角函数变化
         * 
         * Inverse trigonometric rate function.
         */
        export function inverseTrigo(mode: 'sin' | 'tan', ease: EaseMode): TimingFn

        /**
         * 震动变化
         * 
         * Shake rate function.
         * 
         * @param power 最大震动强度，该值越大最大振幅越大 | Maximum vibration intensity, 
         *      the larger the value the greater the maximum amplitude.
         * @param timing 强度的变化函数，当其返回值为1时表示振幅达到最大值 | The rate function of intensity, 
         *      when its return value is 1 means that the amplitude reaches its maximum value.
         * @returns 震动的变化函数 | Shake rate funtion.
         */
        export function shake(power: number, timing?: TimingFn): TimingFn
    }

    /**
     * 路径模块
     */
    export namespace path {
        /**
         * 圆形轨迹
         * 
         * Circular path.
         * 
         * @param r 半径大小 | Radius.
         * @param n 旋转的圈数 | Number of laps.
         * @param timing 半径变化函数，1表示原长，0表示半径为0 | Radius change function, 1 means original length, 
         *      0 means radius is 0
         * @param inverse 是否翻转timing函数 | Whether to flip the timing function.
         */
        export function circle(r: number, n?: number, timing?: TimingFn, inverse?: boolean): PathFn

        /**
         * 贝塞尔曲线轨迹
         * 
         * Bezier curve path.
         * 
         * @param start 起点 | Start point.
         * @param end 终点 | End point.
         * @param cps 控制点，是[x, y]数组 | Control points, which are [x, y] arrays.
         */
        export function bezier(start: Point, end: Point, ...cps: Point[]): PathFn
    }

    /**
     * 工具模块
     */
    export namespace utils {
        /**
         * 判断一个值是否不是null和undefined
         * 
         * Determine if a value is not null and undefined
         * 
         * @param v 要判断的值 | Value to be determined.
         */
        export function has<T>(v: T): v is NonNullable<T>

        /**
         * 判断一个变量是否是某个类型
         * 
         * Determine if a variable is of a certain type
         * 
         * @param v 要判断的值 | Variable to be determined.
         * @param type 类型 | Type to be determined.
         */
        export function is<T extends keyof BaseType>(v: any, type: T): v is BaseType[T]

        /**
         * 判断一个值是否是MTT文件的函数类型
         * 
         * Determine if a value is a function type of an MTT file
         * 
         * @param v 要判断的值 | Value to be determined.
         */
        export function isMTTFn(v: any): v is MTTMode<string>

        /**
         * 判断一个函数的返回值是否是某个类型
         * 
         * Determine if the return value of a function is of a certain type.
         * 
         * @param fn 要判断的函数 | Function to be determined.
         * @param type 要判断的返回值类型 | Type to be determined.
         * @param test 函数的测试参数 | The test parameters of the function.
         */
        export function isReturnType<T extends keyof BaseType>(fn: (...args: any) => any, type: T, ...test: any[]): fn is (...args: any) => T
    }
}