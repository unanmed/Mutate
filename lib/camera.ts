import { AnimationBase } from "./animate";
import { Mutate } from "./core";

type ToOmittedKey = 'getPropertyPriority' | 'length' | 'parentRule'
    | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'

type CssKey = keyof Omit<CSSStyleDeclaration, ToOmittedKey> & string

type CameraSaveInfo = {
    x: number
    y: number
    angle: number
    size: number
}

export class Camera extends AnimationBase {
    /** 存档栈 */
    saveStack: CameraSaveInfo[] = []

    /** 摄像机作用的目标画布 */
    readonly target: CanvasRenderingContext2D
    /** 摄像机id */
    readonly id: string
    /** 游戏实例 */
    readonly game: Mutate

    constructor(game: Mutate, id: string, target: CanvasRenderingContext2D) {
        super();
        this.target = target;
        this.id = id;
        this.game = game;
    }

    /**
     * 保存摄像机状态
     */
    save(): Camera {
        this.saveStack.push({
            x: this.ox,
            y: this.oy,
            angle: this.angle,
            size: this.size
        });
        return this;
    }

    /**
     * 回退摄像机状态
     */
    restore(): Camera {
        const info = this.saveStack.pop();
        if (!info) throw new RangeError(`There is no saves to be restored.`);
        this.ox = info.x;
        this.oy = info.y;
        this.size = info.size;
        this.angle = info.angle;
        return this;
    }

    /**
     * 设置画布的全局特效
     */
    effect(): void {
        const ctx = this.target;
        const scale = this.game.drawScale;
        const dx = 960 * scale;
        const dy = 540 * scale;
        const x = this.x * scale;
        const y = this.y * scale;
        ctx.translate(dx, dy);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.translate(-dx, -dy);
        ctx.translate(x, y);
    }

    /**
     * 设置该摄像机的css
     * @param css 要设置成的css内容
     */
    css(css: string): void {
        const canvas = this.target.canvas;
        const formated = css.replaceAll('\n', ';').replace(/;+/g, ';').trim();
        const all = formated.split(';');

        for (const str of all) {
            const [key, value] = str.split(/\s*:\s*/);
            let id = key.replace(/-([a-z])/g, ($1) => `-${$1.toUpperCase()}`);
            if (id.length === 0) continue;
            id = id[0].toLowerCase() + id.slice(1);
            if (key in canvas.style) {
                canvas.style[key as CssKey] = value;
            }
        }
    }
}