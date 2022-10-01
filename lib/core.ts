import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Chart, MutateChart } from "./chart";
import { Renderer } from "./render";
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
    /** 音频处理模块 */
    readonly ac: AudioContext = new AudioContext()
    /** 谱面信息 */
    readonly chart: Chart = new Chart()
    /** 渲染器 */
    readonly renderer: Renderer = new Renderer()

    constructor(target: HTMLCanvasElement) {
        this.target = target;
        this.ctx = target.getContext('2d') as CanvasRenderingContext2D;
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
        const audio = await this.ac.decodeAudioData(data.data);
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