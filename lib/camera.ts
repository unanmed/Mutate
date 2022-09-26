import { AnimationBase } from "./animate";

export class Camera extends AnimationBase {
    /** 摄像机作用的目标画布 */
    target: CanvasRenderingContext2D

    constructor(target: CanvasRenderingContext2D) {
        super();
        this.target = target;
    }

    /**
     * 切换成该摄像机
     */
    to(): Camera {
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
     * 渲染画布
     */
    render(): void {

    }
}