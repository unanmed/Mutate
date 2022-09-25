import { PathFn } from "./path";
import { TimingFn } from "./timing";

interface CameraTarget {

}

export class Camera {
    /** 渐变函数 */
    timing: TimingFn
    /** 震动变化函数 */
    shakeTiming: TimingFn
    /** 根据路径移动时的路径函数 */
    path: PathFn
    /** 变换时的相对模式，相对或绝对 */
    relation: 'relative' | 'absolute' = 'absolute'
    /** 渐变时间 */
    easeTime: number = 0
    /** 摄像机作用的目标画布 */
    target!: CameraTarget
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
     * 切换成该摄像机
     */
    to(): Camera {
        return this;
    }

    /**
     * 设置移动时的动画函数
     * @param fn 动画函数
     */
    mode(fn: TimingFn, shake: boolean = false): Camera {
        return this;
    }

    /**
     * 保存摄像机状态
     */
    save(): Camera {
        return this;
    }

    /**
     * 回退摄像机状态
     */
    restore(): Camera {
        return this;
    }

    /**
     * 设置渐变动画时间
     * @param time 要设置成的时间
     */
    time(time: number): Camera {
        return this;
    }

    /**
     * 相对模式
     */
    relative(): Camera {
        return this;
    }

    /**
     * 绝对模式
     */
    absolute(): Camera {
        return this;
    }

    /**
     * 移动摄像机
     */
    move(x: number, y: number): Camera {
        return this;
    }

    /**
     * 旋转摄像机
     * @param angle 旋转角度，注意不是弧度
     */
    rotate(angle: number): Camera {
        return this;
    }

    /**
     * 缩放摄像机视野
     * @param scale 视野大小
     */
    scale(scale: number): Camera {
        return this;
    }

    /**
     * 震动摄像机
     * @param x 横向震动比例，范围0-1
     * @param y 纵向震动比例，范围0-1
     */
    shake(x: number, y: number): Camera {
        return this;
    }

    /**
     * 根据路径移动摄像机
     */
    moveAs(path: PathFn): Camera {
        return this;
    }

    /**
     * 执行现有动画
     */
    private animate(): void {

    }
}