import { AnimationBase } from "./animate";

type CssKey = keyof CSSStyleDeclaration

export class Camera extends AnimationBase {
    /** 摄像机作用的目标画布 */
    target: CanvasRenderingContext2D
    id: string

    constructor(id: string, target: CanvasRenderingContext2D) {
        super();
        this.target = target;
        this.id = id;
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

    /**
     * 添加每帧绘制函数
     */
    private addTicker(): void {

    }

    /**
     * 设置该摄像机的css
     * @param css 要设置成的css内容
     */
    css(css: string): void {

    }
}