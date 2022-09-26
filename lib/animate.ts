import { PathFn } from "./path"
import { TimingFn } from "./timing"
import { cloneDeep } from 'lodash'

type AnimateFn = (e: AnimationBase) => void

type AnimateType = 'move' | 'rotate' | 'resize' | 'shake'

type AnimateTime = 'start' | 'end'

/**
 * 动画生命周期钩子
 */
type AnimateHook = `${AnimateType}${AnimateTime}` | AnimateType

const listener = {
    'move': [],
    'moveend': [],
    'movestart': [],
    'resize': [],
    'resizeend': [],
    'resizestart': [],
    'rotate': [],
    'rotateend': [],
    'rotatestart': [],
    'shake': [],
    'shakeend': [],
    'shakestart': []
}

export class AnimationBase {
    /** 渐变函数 */
    timing: TimingFn
    /** 震动变化函数 */
    shakeTiming: TimingFn
    /** 根据路径移动时的路径函数 */
    path: PathFn
    /** 所有的监听函数 */
    private readonly listener: { [T in AnimateHook]: AnimateFn[] } = cloneDeep(listener);
    /** 变换时的相对模式，相对或绝对 */
    relation: 'relative' | 'absolute' = 'absolute'
    /** 渐变时间 */
    easeTime: number = 0
    x: number = 0
    y: number = 0
    size: number = 0
    angle: number = 0

    constructor() {
        this.timing = n => n;
        this.shakeTiming = n => n;
        this.path = n => [n, n];
    }

    /**
     * 设置移动时的动画函数
     * @param fn 动画函数
     */
    mode(fn: TimingFn, shake: boolean = false): AnimationBase {
        return this;
    }

    /**
     * 设置渐变动画时间
     * @param time 要设置成的时间
     */
    time(time: number): AnimationBase {
        return this;
    }

    /**
     * 相对模式
     */
    relative(): AnimationBase {
        return this;
    }

    /**
     * 绝对模式
     */
    absolute(): AnimationBase {
        return this;
    }

    /**
     * 移动
     */
    move(x: number, y: number): AnimationBase {
        return this;
    }

    /**
     * 旋转
     * @param angle 旋转角度，注意不是弧度
     */
    rotate(angle: number): AnimationBase {
        return this;
    }

    /**
     * 缩放
     * @param scale 缩放比例
     */
    scale(scale: number): AnimationBase {
        return this;
    }

    /**
     * 震动
     * @param x 横向震动比例，范围0-1
     * @param y 纵向震动比例，范围0-1
     */
    shake(x: number, y: number): AnimationBase {
        return this;
    }

    /**
     * 根据路径移动
     */
    moveAs(path: PathFn): AnimationBase {
        return this;
    }

    /**
     * 等待任何一个正在执行的动画操作执行完毕
     */
    async race(): Promise<void> {
        await this.n(1);
    }

    /**
     * 等待所有的正在执行的动画操作执行完毕
     */
    async all(): Promise<void> {

    }

    /**
     * 等待n个正在执行的动画操作执行完毕
     * @param n 要等待的个数
     */
    async n(n: number): Promise<void> {

    }

    /**
     * 等待某个种类的动画执行完毕
     * @param type 要等待的种类
     */
    async w(type: AnimateType): Promise<void> {

    }

    /**
     * 监听动画
     * @param type 监听类型
     * @param fn 监听函数，动画执行过程中会执行该函数
     */
    listen(type: AnimateHook, fn: AnimateFn): void {

    }

    /**
     * 取消监听
     * @param type 监听类型
     * @param fn 取消监听的函数
     */
    unlisten(type: AnimateHook, fn: AnimateFn): void {

    }

    /**
     * 执行现有动画
     */
    private animate(): void {

    }
}