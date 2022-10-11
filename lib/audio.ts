import { Mutate, MutateStatus } from "./core";
import { has } from "./utils";

export class AudioExtractor {

    /** 音频信息 */
    audio!: AudioBuffer
    /** 音频播放状态 */
    status: MutateStatus = 'pre'
    /** 开始播放时的时间，用于计算音乐时间 */
    startTime: number = 0
    /** 音效的音量 */
    seVolume: number = 0.5
    /** 音乐的音量 */
    musicVolume: number = 1
    /** 谱面误差 */
    offset: number = -100

    set volume(v: number) {
        this.mainGain.gain.value = v;
    }

    get volume(): number {
        return this.mainGain.gain.value;
    }

    /** 游戏实例 */
    readonly game: Mutate
    /** 音频处理模块 */
    readonly ac: AudioContext = new AudioContext()
    /** 音效 */
    readonly sounds: { [key: string]: AudioBuffer } = {}
    /** 全局音量控制器 */
    readonly mainGain = this.ac.createGain()

    /** 当前音乐资源节点 */
    private musicNode!: AudioBufferSourceNode

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
        if (this.status === 'playing') throw new TypeError(`The game music is playing now.`);
        this.startTime = this.ac.currentTime;
        this.game.time = (this.ac.currentTime - this.startTime) * 1000;
        const gain = this.ac.createGain();
        const source = this.ac.createBufferSource();
        this.musicNode = source;
        source.buffer = this.audio;
        source.connect(gain);
        gain.gain.value = this.musicVolume;
        gain.connect(this.mainGain);
        this.mainGain.connect(this.ac.destination);
        source.start();
        this.status = 'playing';
        this.startTime = this.ac.currentTime;
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
        gain.gain.value = this.seVolume;
        source.buffer = this.sounds[key];
        source.connect(gain);
        gain.connect(this.mainGain);
        this.mainGain.connect(this.ac.destination);
        source.start();
    }

    /**
     * 重新播放音频
     */
    restart(): void {
        this.musicNode.stop();
        this.syncTime();
        this.status = 'pre';
        this.game.time = this.offset;
    }

    /**
     * 添加同步音频时间的函数
     */
    private syncTime(): void {
        const fn = () => {
            if (this.status === 'pre') {
                this.game.time = this.offset;
            } else {
                this.game.time = (this.ac.currentTime - this.startTime) * 1000 + this.offset;
            }
        }
        this.game.ticker.add(fn, true);
    }
}