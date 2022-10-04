import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { AudioExtractor } from "./audio";
import { Chart, MutateChart } from "./chart";
import { NoteShadow, NoteType } from "./note";
import { circle, bezier as bezierPath } from "./path";
import { Renderer } from "./render";
import { Ticker } from "./ticker";
import { bezier, hyper, inverseTrigo, linear, power, shake, trigo } from "./timing";
import { has } from "./utils";

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

export interface MutateOption {
    noteScale: number
    noteWidth: number
    perfect: number
    good: number
    miss: number
}

export class Mutate {
    /** 音频信息 */
    audio!: AudioBuffer
    /** 读取的mtt谱面对象 */
    mtt!: MutateChart
    /** 游戏状态 */
    status: MutateStatus = 'pre'
    /** 音乐时间，秒数 */
    time: number = 0
    /** 谱面物量 */
    length: number = 0
    /** 是否已经结束游戏 */
    ended: boolean = false

    /** 是否是移动设备 */
    readonly isMobile: boolean = window.innerWidth < window.innerHeight
    /** 游戏渲染目标 */
    readonly target: HTMLCanvasElement
    /** 目标的context */
    readonly ctx: CanvasRenderingContext2D
    /** 核心ticker，用于计算音乐时间等 */
    readonly ticker: Ticker = new Ticker()
    /** 音频处理模块 */
    readonly ac: AudioExtractor = new AudioExtractor(this)
    /** 谱面信息 */
    readonly chart: Chart = new Chart(this)
    /** 渲染器 */
    readonly renderer: Renderer = new Renderer(this)
    /** 游戏宽度 */
    readonly width: number
    /** 游戏高度 */
    readonly height: number
    /** 放缩比例 */
    readonly scale: number
    /** 音符放缩比例 */
    readonly noteScale: number = 1
    /** 音符的长度 */
    readonly noteWidth: number = this.isMobile ? 300 : 150
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
    readonly defaultStroke: CanvasGradient
    /** 完美判定区间 */
    readonly perfect: number = 50
    /** 好的判定区间 */
    readonly good: number = 80
    /** miss的判定区间 */
    readonly miss: number = 120

    constructor(target: HTMLCanvasElement, option?: Partial<MutateOption>) {
        this.target = target;
        this.ctx = target.getContext('2d') as CanvasRenderingContext2D;
        this.ctx.save();
        this.width = target.width;
        this.height = target.height;
        this.scale = Math.min(this.width / 1920, this.height / 1080);
        // 如果画布不是16:9，那么自动调整
        if (target.width / target.height !== parseFloat((16 / 9).toFixed(7))) {
            const ws = this.width / 1920;
            const hs = this.height / 1080;
            if (ws < hs) {
                const height = target.width * 9 / 16
                target.height = height;
                target.style.height = `${height}px`;
            } else {
                const width = target.height * 16 / 9;
                target.width = width;
                target.style.width = `${width}px`;
            }
        }
        // 配置信息
        this.noteScale = option?.noteScale ?? 1;
        this.noteWidth = option?.noteWidth ?? this.noteWidth;
        this.perfect = option?.perfect ?? 50;
        this.good = option?.good ?? 80;
        this.miss = option?.miss ?? 120;
        // 计算默认属性
        this.drawScale = this.scale * this.noteScale;
        this.drawWidth = this.noteWidth * this.drawScale;
        this.halfWidth = this.drawWidth / 2;
        this.drawHeight = this.drawWidth / 10;
        this.halfHeight = this.drawHeight / 2;
        this.topWidth = this.drawWidth - this.halfHeight * 2;
        this.halfTopWidth = this.topWidth / 2;
        this.defaultStroke = this.ctx.createLinearGradient(0, -this.halfHeight, 0, this.halfHeight);
        this.defaultStroke.addColorStop(0, '#fff');
        this.defaultStroke.addColorStop(0.5, '#fef267');
        this.defaultStroke.addColorStop(1, '#fff');
        // 监听触摸事件
        target.addEventListener('touchstart', this.chart.judger.touchstart);
        target.addEventListener('touchend', this.chart.judger.touchend);
        // 注册系统动画类型
        this.chart.register('generator', 'linear', linear);
        this.chart.register('generator', 'bezier', bezier);
        this.chart.register('generator', 'trigo', trigo);
        this.chart.register('generator', 'power', power);
        this.chart.register('generator', 'hyper', hyper);
        this.chart.register('generator', 'inverseTrigo', inverseTrigo);
        this.chart.register('generator', 'shake', shake);
        this.chart.register('pathG', 'circle', circle);
        this.chart.register('pathG', 'bezier', bezierPath);
        // 注册系统预执行函数
        this.chart.registerExecute('base', 'r', (v: number, t) => t.setRadius(v));
        this.chart.registerExecute('base', 'bpm', (v: number, t) => t.setSpeed(v));
        this.chart.registerExecute('base', 'rgba', (v: number[], t) => t.rgba(...v));
        this.chart.registerExecute('note', 'speed', (v: number, t) => t.setSpeed(v));
        this.chart.registerExecute('note', 'filter', (v: string, t) => t.filter(v));
        this.chart.registerExecute('note', 'shadow', (v: NoteShadow, t) => t.shadow(v.x, v.y, v.blur, v.color));
        this.chart.registerExecute('note', 'opacity', (v: number, t) => t.opacity(v));
        this.chart.registerExecute('camera', 'css', (v: string, t) => t.css(v));
    }

    /**
     * 加载游戏资源
     * @param music 音乐资源
     * @param mtt 谱面资源
     */
    async load(music: string, mtt: string): Promise<void> {
        if (has(this.audio) || has(this.mtt))
            throw new TypeError(`The game's music or chart has already been loaded.`);
        const task = [this.loadMusic(music), this.loadMTT(mtt)];
        await Promise.all(task);
    }

    /**
     * 开始游戏
     */
    start(): void {
        if (this.status !== 'pre') throw new TypeError(`The game has already started.`);
        this.status = 'playing';
        this.renderer.start();
        this.ac.play();
    }

    /**
     * 暂停
     */
    pause(): void {
        if (this.status === 'pause') throw new TypeError(`The game has already paused.`);
        this.status = 'pause';
        this.ac.pause();
    }

    /**
     * 恢复游戏的进行
     */
    resume(): void {
        if (this.status === 'playing') throw new TypeError(`The game has already resumed.`);
        this.status = 'playing'
        this.ac.resume();
    }

    /**
     * 重新开始游戏
     */
    async restart(): Promise<void> {
        this.chart.judger.toJudge = [];
        await this.chart.restart();
        this.ac.restart();
    }

    /**
     * 结束本局游戏，取消与canvas的绑定
     */
    end(): void {
        this.ticker.destroy();
        this.ac.pause();
        this.ended = true;
        this.chart.camera.ticker.destroy();
        const bases = this.chart.bases;
        Object.values(bases).forEach(v => v.ticker.destroy());
        const notes = this.chart.notes;
        Object.values(notes).forEach(v => v.ticker.destroy());
    }

    /**
     * 获取分数
     */
    getScore(): number {
        const per = 900000 / this.length;
        const judger = this.chart.judger;
        const combo = judger.maxCombo / this.length * 100000;
        return Math.round(per * judger.perfect + per * 0.5 * judger.good + combo);
    }

    /**
     * 获取结算的详细信息
     */
    getDetail(): MutateDetail {
        const { perfect, good, miss, early, late } = this.chart.judger;
        return { perfect, good, miss, early, late };
    }

    /**
     * 设置音符的打击音效
     */
    async setSound(type: NoteType, url: string): Promise<void> {
        const buffer = await this.post(url, 'arraybuffer');
        this.ac.addSound(type, buffer.data);
    }

    /**
     * 进行一次请求
     * @param url 请求地址
     * @param type 接收的数据类型
     */
    private async post<T extends keyof PostType>(url: string, type: T): Promise<AxiosResponse<PostType[T]>> {
        const config: AxiosRequestConfig = {
            responseType: type,
            timeout: 60000
        }
        return await axios.get(url, config);
    }

    /**
     * 加载某个音乐
     * @param url 音乐的地址
     */
    private async loadMusic(url: string): Promise<void> {
        const data = await this.post(url, 'arraybuffer');
        if (data.status !== 200) return this.fail(`Fail to load url [${url}]`, data.status);
        const audio = await this.ac.extract(data.data);
        this.audio = audio;
    }

    /**
     * 加载某个音乐
     * @param url 谱面的地址
     */
    private async loadMTT(url: string): Promise<void> {
        const data = await this.post(url, 'json');
        if (data.status !== 200) return this.fail(`Fail to load url [${url}]`, data.status);
        this.mtt = data.data;
        this.chart.extract(this.mtt);
    }

    /**
     * 加载失败
     * @param text 失败信息
     */
    private fail(text: string, status: number): void {
        console.error(`${status}: ${text}`);
    }
}

/**
 * 创建一个mutate游戏
 * @param target 目标画布
 */
export function create(target: HTMLCanvasElement, option?: MutateOption): Mutate {
    return new Mutate(target, option);
}