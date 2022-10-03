import { Mutate, MutateStatus } from "./core";
import { has } from "./utils";

export class AudioExtractor {

    /** 音频信息 */
    audio!: AudioBuffer
    /** 音频播放状态 */
    status: MutateStatus = 'pre'
    /** 开始播放时的时间，用于计算音乐时间 */
    startTime: number = 0

    /** 游戏实例 */
    readonly game: Mutate
    /** 音频处理模块 */
    readonly ac: AudioContext = new AudioContext()
    /** 音效 */
    readonly sounds: { [key: string]: AudioBuffer } = {}

    constructor(game: Mutate) {
        this.game = game;
        this.syncTime();
    }

    /**
     * 解析ArrayBuffer为音频文件
     */
    async extract(buffer: ArrayBuffer): Promise<AudioBuffer> {
        const data = await this.ac.decodeAudioData(buffer);
        this.audio = data;
        return data;
    }

    /**
     * 播放音频
     */
    play(): void {
        if (this.status !== 'pre') throw new TypeError(`The game music is playing now.`);
        this.status = 'playing';
        const gain = this.ac.createGain();
        const source = this.ac.createBufferSource();
        source.buffer = this.audio;
        source.connect(gain);
        gain.connect(this.ac.destination);
        source.start();
        source.addEventListener('ended', e => {
            this.status = 'exit';
        });
    }

    /**
     * 暂停播放
     */
    async pause(): Promise<void> {
        if (this.status !== 'playing') throw new TypeError(`You are trying to pause an already paused music.`);
        await this.ac.suspend();
        this.status = 'pause';
    }

    /**
     * 继续播放
     */
    async resume(): Promise<void> {
        if (this.status !== 'pause') throw new TypeError(`You are trying to resume an already playing music.`);
        await this.ac.resume();
        this.status = 'playing';
    }

    /**
     * 添加音效
     */
    async addSound(key: string, buffer: ArrayBuffer): Promise<void> {
        const data = await this.ac.decodeAudioData(buffer);
        this.sounds[key] = data;
    }

    /**
     * 播放音效
     */
    playSound(key: string): void {
        if (!has(this.sounds[key])) return;
        const gain = this.ac.createGain();
        const source = this.ac.createBufferSource();
        gain.gain.value = 0.5;
        source.buffer = this.sounds[key];
        source.connect(gain);
        gain.connect(this.ac.destination);
        source.start();
    }

    /**
     * 添加同步音频时间的函数
     */
    private syncTime(): void {
        const fn = () => {
            const time = this.ac.currentTime;
            if (this.status === 'pre') this.startTime = time;
            this.game.time = (time - this.startTime) * 1000;
        }
        this.game.ticker.add(fn, true);
    }
}