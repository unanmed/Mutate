import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { sleep } from './animate';
import { AudioExtractor } from './audio';
import { Chart, MutateChart } from './chart';
import { Editor } from './editor';
import { MutateEventTarget } from './event';
import { CoreEventMap, LoadEvent, StartEvent, TriggerEvent } from './event.map';
import { NoteShadow, NoteType } from './note';
import { circle, bezier as bezierPath } from './path';
import { Renderer } from './render';
import { Ticker } from './ticker';
import {
    bezier,
    hyper,
    inverseTrigo,
    linear,
    power,
    shake,
    trigo
} from './timing';
import { has } from './utils';

/**
 * 游戏状态
 */
export type MutateStatus = 'pre' | 'playing' | 'pause' | 'exit';

/**
 * 请求类型
 */
export interface PostType {
    arraybuffer: ArrayBuffer;
    json: MutateChart;
}

/**
 * 结算时的详细信息
 */
export type MutateDetail = {
    perfect: number;
    good: number;
    miss: number;
    early: number;
    late: number;
};

export interface MutateOption {
    noteScale: number;
    noteWidth: number;
    perfect: number;
    good: number;
    miss: number;
    mode: 'play' | 'edit';
}

export interface ScoreParameters extends MutateDetail {
    length: number;
    maxCombo: number;
}

export type ScoreCalculator = (e: ScoreParameters) => number;

export class Mutate extends MutateEventTarget<CoreEventMap> {
    /** 音频信息 */
    audio!: AudioBuffer;
    /** 读取的mtt谱面对象 */
    mtt!: MutateChart;
    /** 游戏状态 */
    status: MutateStatus = 'pre';
    /** 音乐时间，毫秒数 */
    time: number = 0;
    /** 谱面物量 */
    length: number = 0;
    /** 是否已经结束游戏 */
    ended: boolean = false;
    /** 分数计算函数 */
    scoreCalculator: ScoreCalculator = this.defaultScoreCalculator;

    /** 是否是移动设备 */
    readonly isMobile: boolean = window.innerWidth < window.innerHeight;
    /** 游戏渲染目标 */
    readonly target: HTMLCanvasElement;
    /** 目标的context */
    readonly ctx: CanvasRenderingContext2D;
    /** 核心ticker，用于计算音乐时间等 */
    readonly ticker: Ticker = new Ticker();
    /** 音频处理模块 */
    readonly ac: AudioExtractor = new AudioExtractor(this);
    /** 谱面信息 */
    readonly chart: Chart = new Chart(this);
    /** 渲染器 */
    readonly renderer: Renderer = new Renderer(this);
    /** 编辑器 */
    readonly editor: Editor;
    /** 游戏宽度 */
    readonly width: number;
    /** 游戏高度 */
    readonly height: number;
    /** 放缩比例 */
    readonly scale: number;
    /** 音符放缩比例 */
    readonly noteScale: number = 1;
    /** 音符的长度 */
    readonly noteWidth: number = this.isMobile ? 200 : 150;
    /** 音符的绘制比例 */
    readonly drawScale: number;
    /** 音符的宽度 */
    readonly drawWidth: number;
    /** 音符宽度的一半 */
    readonly halfWidth: number;
    /** 音符高度 */
    readonly drawHeight: number;
    /** 音符高度的一半 */
    readonly halfHeight: number;
    /** 音符的上部宽度 */
    readonly topWidth: number;
    /** 音符上宽的一半 */
    readonly halfTopWidth: number;
    /** 默认的音符描边样式 */
    readonly multiStroke: CanvasGradient;
    /** 完美判定区间 */
    readonly perfect: number = 50;
    /** 好的判定区间 */
    readonly good: number = 80;
    /** miss的判定区间 */
    readonly miss: number = 120;
    /** 模式，编辑还是游戏 */
    readonly mode: 'play' | 'edit';

    constructor(target: HTMLCanvasElement, option?: Partial<MutateOption>) {
        super();
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
                const height = (target.width * 9) / 16;
                target.height = height;
                target.style.height = `${height}px`;
            } else {
                const width = (target.height * 16) / 9;
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
        this.mode = option?.mode ?? 'play';
        // 计算默认属性
        this.drawScale = this.scale * this.noteScale;
        this.drawWidth = this.noteWidth * this.drawScale;
        this.halfWidth = this.drawWidth / 2;
        this.drawHeight = this.drawWidth / 10;
        this.halfHeight = this.drawHeight / 2;
        this.topWidth = this.drawWidth - this.halfHeight * 2;
        this.halfTopWidth = this.topWidth / 2;
        this.multiStroke = this.ctx.createLinearGradient(
            0,
            -this.halfHeight,
            0,
            this.halfHeight
        );
        this.multiStroke.addColorStop(0, '#fff');
        this.multiStroke.addColorStop(0.5, '#fef267');
        this.multiStroke.addColorStop(1, '#fff');
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
        this.chart.registerExecute('base', 'r', (v: number, t) =>
            t.setRadius(v)
        );
        this.chart.registerExecute('base', 'bpm', (v: number, t) =>
            t.setSpeed(v)
        );
        this.chart.registerExecute('base', 'rgba', (v: number[], t) =>
            t.rgba(...v)
        );
        this.chart.registerExecute('base', 'filter', (v: string, t) =>
            t.filter(v)
        );
        this.chart.registerExecute('note', 'speed', (v: number, t) =>
            t.setSpeed(v)
        );
        this.chart.registerExecute('note', 'filter', (v: string, t) =>
            t.filter(v)
        );
        this.chart.registerExecute('note', 'shadow', (v: NoteShadow, t) =>
            t.shadow(v.x, v.y, v.blur, v.color)
        );
        this.chart.registerExecute('note', 'opacity', (v: number, t) =>
            t.opacity(v)
        );
        this.chart.registerExecute('camera', 'css', (v: string, t) => t.css(v));
        // 初始化编辑器
        this.editor = new Editor(this);
    }

    /**
     * 加载游戏资源
     * @param music 音乐资源
     * @param mtt 谱面资源
     */
    async load(
        music: string | AudioBuffer,
        mtt: string | MutateChart,
        onMusicProgress?: (e: ProgressEvent) => void,
        onMTTProgress?: (e: ProgressEvent) => void
    ): Promise<void> {
        const startTime = Date.now();

        if (has(this.audio) || has(this.mtt))
            throw new TypeError(
                `The game's music or chart has already been loaded.`
            );

        const task = [];
        if (typeof music === 'string') {
            task.push(this.loadMusic(music, onMusicProgress));
        } else {
            this.audio = music;
            this.ac.audio = music;
        }

        if (typeof mtt === 'string') {
            task.push(this.loadMTT(mtt, onMTTProgress));
        } else {
            this.mtt = mtt;
            this.chart.extract(mtt);
        }

        await Promise.all(task);

        const e: LoadEvent<'load'> = {
            target: this,
            type: 'load',
            time: Date.now() - startTime
        };
        this.dispatch('load', e);
    }

    /**
     * 开始游戏
     */
    async start(time: number = 1000): Promise<void> {
        if (this.mode === 'edit')
            throw new TypeError(`Game cannot start when mode is edit.`);
        if (this.status !== 'pre')
            throw new TypeError(`The game has already started or ended.`);
        await sleep(time);
        this.status = 'playing';
        this.ac.play();
        this.renderer.start();

        const e: StartEvent<'start'> = {
            target: this,
            type: 'start',
            music: this.ac.audio,
            mtt: this.mtt
        };
        this.dispatch('start', e);
    }

    /**
     * 暂停
     */
    pause(): void {
        const from = this.status as Exclude<MutateStatus, 'exit'>;
        if (this.status === 'pause')
            throw new TypeError(`The game has already paused.`);
        this.status = 'pause';
        this.ac.pause();

        const e: TriggerEvent<'pause'> = {
            target: this,
            type: 'pause',
            from,
            to: this.status
        };
        this.dispatch('pause', e);
    }

    /**
     * 恢复游戏的进行
     */
    resume(): void {
        const from = this.status as Exclude<MutateStatus, 'exit'>;
        if (this.status === 'playing')
            throw new TypeError(`The game has already resumed.`);
        this.status = 'playing';
        this.ac.resume();

        const e: TriggerEvent<'resume'> = {
            target: this,
            type: 'resume',
            from,
            to: this.status
        };
        this.dispatch('resume', e);
    }

    /**
     * 重新开始游戏
     */
    async restart(time: number = 1000): Promise<void> {
        this.ticker.clear();
        this.ctx.restore();
        this.ctx.clearRect(0, 0, this.target.width, this.target.height);
        this.renderer.clearEffect();
        this.status = 'pre';
        this.chart.judger.toJudge = [];
        this.chart.camera.ticker.destroy();
        this.ac.restart();
        await this.chart.restart();
        const e: StartEvent<'restart'> = {
            target: this,
            type: 'restart',
            music: this.ac.audio,
            mtt: this.mtt
        };
        this.dispatch('restart', e);
        this.start(time);
    }

    /**
     * 结束本局游戏，取消与canvas的绑定
     */
    end(): void {
        if (this.status === 'exit')
            throw new TypeError(`The game has already ended.`);
        const from = this.status;
        this.ticker.destroy();
        this.ac.pause();
        this.ended = true;
        this.status = 'exit';
        this.chart.camera.ticker.destroy();
        const bases = this.chart.bases;
        Object.values(bases).forEach(v => v.ticker.destroy());
        const notes = this.chart.notes;
        Object.values(notes).forEach(v => v.ticker.destroy());

        const e: TriggerEvent<'end'> = {
            target: this,
            type: 'end',
            from,
            to: this.status
        };
        this.dispatch('end', e);
    }

    /**
     * 设置谱面偏差，正，谱面将会提前，负，谱面将会延后
     */
    setOffset(time: number): void {
        if (this.status !== 'pre')
            throw new TypeError(
                `Offset can only be set before the game starts.`
            );
        this.ac.offset = time;
    }

    /**
     * 获取分数
     */
    getScore(): number {
        const e: ScoreParameters = {
            ...this.getDetail(),
            length: this.length,
            maxCombo: this.chart.judger.maxCombo
        };
        return this.scoreCalculator(e);
    }

    /**
     * 获取结算的详细信息
     */
    getDetail(): MutateDetail {
        const { perfect, good, miss, early, late } = this.chart.judger;
        return { perfect, good, miss, early, late };
    }

    /**
     * 设置分数的计算函数
     */
    setScoreCalculator(fn: ScoreCalculator): void {
        this.scoreCalculator = fn;
    }

    /**
     * 设置音符的打击音效
     */
    async setSound(type: NoteType, url: string): Promise<void> {
        const buffer = await this.post(url, 'arraybuffer');
        await this.ac.addSound(type, buffer.data);
    }

    /**
     * 进行一次请求
     * @param url 请求地址
     * @param type 接收的数据类型
     */
    private async post<T extends keyof PostType>(
        url: string,
        type: T,
        on?: (e: ProgressEvent) => void
    ): Promise<AxiosResponse<PostType[T]>> {
        const config: AxiosRequestConfig = {
            responseType: type,
            onDownloadProgress: on
        };
        return await axios.get(url, config);
    }

    /**
     * 加载某个音乐
     * @param url 音乐的地址
     */
    private async loadMusic(
        url: string,
        on?: (e: ProgressEvent) => void
    ): Promise<void> {
        const data = await this.post(url, 'arraybuffer', on);
        if (data.status !== 200)
            return this.fail(`Fail to load url [${url}]`, data.status);
        const audio = await this.ac.extract(data.data);
        this.audio = audio;
    }

    /**
     * 加载某个音乐
     * @param url 谱面的地址
     */
    private async loadMTT(
        url: string,
        on?: (e: ProgressEvent) => void
    ): Promise<void> {
        const data = await this.post(url, 'json', on);
        if (data.status !== 200)
            return this.fail(`Fail to load url [${url}]`, data.status);
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

    /**
     * 默认的分数计算函数
     */
    private defaultScoreCalculator(e: ScoreParameters): number {
        const per = 900000 / this.length;
        const judger = this.chart.judger;
        const combo = (judger.maxCombo / this.length) * 100000;
        return Math.round(
            per * judger.perfect + per * 0.5 * judger.good + combo
        );
    }
}

/**
 * 创建一个mutate游戏
 * @param target 目标画布
 */
export function create(
    target: HTMLCanvasElement,
    option?: MutateOption
): Mutate {
    return new Mutate(target, option);
}
