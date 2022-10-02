import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { AudioExtractor } from "./audio";
import { Chart, MutateChart } from "./chart";
import { NoteShadow } from "./note";
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
}

export class Mutate {
    /** 音频信息 */
    audio!: AudioBuffer
    /** 读取的mtt谱面对象 */
    mtt!: MutateChart
    /** 游戏状态 */
    status: MutateStatus = 'pre'
    /** 音乐时间 */
    time: number = 0
    /** 谱面物量 */
    length: number = 0

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

    constructor(target: HTMLCanvasElement) {
        this.target = target;
        this.ctx = target.getContext('2d') as CanvasRenderingContext2D;
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
        this.renderer.start();
        this.ac.play();
    }

    /**
     * 暂停
     */
    pause(): void {
        if (this.status === 'pause') throw new TypeError(`The game has already paused.`);
        this.renderer.pause();
        this.ac.pause();
    }

    /**
     * 恢复游戏的进行
     */
    resume(): void {
        if (this.status === 'playing') throw new TypeError(`The game has already resumed.`);
        this.renderer.resume();
        this.ac.resume();
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
        console.log(data.data);
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
export function create(target: HTMLCanvasElement): Mutate {
    return new Mutate(target);
}