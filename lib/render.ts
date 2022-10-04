import { Base } from "./base";
import { Chart } from "./chart";
import { Mutate } from "./core";
import { BaseNote, NoteType, PlayedEffect } from "./note";
import { has } from "./utils";

export type RenderMap = {
    note: BaseNote<NoteType>
    base: Base
}

export type GameRenderer = {
    base: (e: Base) => void
    tap: (e: BaseNote<'tap'>) => void
    hold: (e: BaseNote<'hold'>) => void
    drag: (e: BaseNote<'drag'>) => void
}

export type ToDrawEffect = {
    start: number
    res: 'perfect' | 'good' | 'miss'
    note: BaseNote<NoteType>
}

export class Renderer {
    /** 当前音乐时间 */
    time: number = 0
    /** 所有的音符 */
    notes: Chart['notes'] = {}
    /** 所有的基地 */
    bases: Chart['bases'] = {}
    /** 按id区分的基地 */
    baseDict: Chart['basesDict'] = {}

    /** 游戏实例 */
    readonly game: Mutate
    /** 渲染器 */
    readonly renderer: GameRenderer = {
        base: this.renderBases,
        tap: this.renderTap,
        hold: this.renderHold,
        drag: this.renderDrag
    }
    /** 打击特效 */
    readonly effect: PlayedEffect = {
        perfect: this.perfectEffect,
        good: this.goodEffect,
        miss: this.missEffect
    }
    readonly effects: ToDrawEffect[] = []

    constructor(game: Mutate) {
        this.game = game;
        this.game.chart.onExtracted = (chart) => {
            this.notes = chart.notes;
            this.bases = chart.bases;
            this.baseDict = chart.basesDict;
        }
    }

    /**
     * 开始绘制谱面
     */
    start(): void {
        const fn = () => {
            if (this.game.status !== 'playing') return;
            this.render();
        }

        this.game.ticker.add(fn);
    }

    /**
     * 渲染所有内容
     */
    render(): void {
        const ctx = this.game.ctx;
        ctx.restore();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();

        this.game.chart.camera.effect();

        // 基地
        const bases = this.game.chart.bases;
        for (const num in bases) {
            const base = bases[num];
            this.renderer.base.call(this, base);
        }

        // 音符
        const notes = this.game.chart.notes;
        for (const num in notes) {
            const note = notes[num];
            if (note.played) continue;
            if (note.noteType === 'tap') this.renderer.tap.call(this, note as BaseNote<'tap'>);
            if (note.noteType === 'hold') this.renderer.hold.call(this, note as BaseNote<'hold'>);
            if (note.noteType === 'drag') this.renderer.drag.call(this, note as BaseNote<'drag'>);
        }

        // 特效
        const effect = this.effects;
        for (const data of effect) {
            if (data.res === 'perfect') this.effect.perfect.call(this, data);
            if (data.res === 'good') this.effect.good.call(this, data);
            if (data.res === 'miss') this.effect.miss.call(this, data);
        }
    }

    /**
     * 设置基地的绘制函数
     */
    setBase(fn: (e: Base) => void): void {
        this.renderer.base = fn;
    }

    /**
     * 设置音符的绘制函数
     */
    setNote<T extends NoteType>(type: T, fn: (e: BaseNote<T>) => void): void {
        (this.renderer[type] as (e: BaseNote<T>) => void) = fn;
    }

    /**
     * 判断一个物体是否在游戏画面内
     */
    inGame(x: number, y: number, r: number = 10): boolean {
        const camera = this.game.chart.camera;
        const left = camera.x,
            top = camera.y;

        return x >= -r - 50 + left &&
            x <= 1920 + r + 50 + left &&
            y >= -r - 50 + top &&
            y <= 1080 + r + 50 + top;
    }

    /**
     * 渲染tap音符
     */
    private renderTap(note: BaseNote<'tap'>): void {
        this.renderNonHold(note, '#00d2eb');
    }

    /**
     * 渲染hold音符
     */
    private renderHold(note: BaseNote<'hold'>): void {
        // hold判定是否绘制比较麻烦，因为hold很长

    }

    /**
     * 渲染drag音符
     */
    private renderDrag(note: BaseNote<'drag'>): void {
        this.renderNonHold(note, '#f500d6');
    }

    /**
     * 绘制非hold音符
     */
    private renderNonHold(note: BaseNote<Exclude<NoteType, 'hold'>>, fillColor: string) {
        if (has(note.noteTime) && this.game.time > note.noteTime + note.missTime) return;

        let distance = note.calDistance();

        if (distance <= -note.base.custom.radius) return;

        distance += note.base.custom.radius;
        const dx = distance * note.dir[0] + note.x,
            dy = distance * note.dir[1] + note.y;
        const x = dx + note.base.x,
            y = dy + note.base.y;
        if (!this.inGame(x, y)) return;

        const rad = note.rad + note.angle * Math.PI / 180;
        const ctx = this.game.ctx;
        const hw = this.game.halfWidth;
        const htw = this.game.halfTopWidth;
        const hh = this.game.halfHeight;
        const style = this.game.defaultStroke;

        ctx.save();
        ctx.translate(x * this.game.drawScale, y * this.game.drawScale);
        ctx.rotate(rad + Math.PI / 2);
        // 绘制
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 4 * this.game.drawScale;
        if (note.multi) {
            ctx.shadowColor = 'gold';
            ctx.strokeStyle = style;
        }
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.lineTo(-htw, -hh);
        ctx.lineTo(htw, -hh);
        ctx.lineTo(hw, 0);
        ctx.lineTo(htw, hh);
        ctx.lineTo(-htw, hh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 恢复画布属性
        ctx.restore();
    }

    /**
     * 渲染基地
     */
    private renderBases(base: Base): void {
        if (!this.inGame(base.x, base.y)) return;
        const rad = base.calRad() + base.angle * Math.PI / 180;
        const ctx = this.game.ctx;
        // 基地比较好画
        const scale = this.game.drawScale;
        const x = base.x * scale,
            y = base.y * scale;
        const radius = base.custom.radius * scale;
        const { r, g, b, a } = base.custom;

        // 绘制
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rad + Math.PI);
        ctx.moveTo(0, 0);
        ctx.fillStyle = ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(-radius, -radius * 0.06, radius, radius * 0.12);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 2 / 5, 0, Math.PI * 2);
        ctx.closePath();
        ctx.lineWidth = radius / 10 * scale;
        ctx.fill();
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.arc(0, 0, radius * 0.6, -Math.PI / 8, +Math.PI / 8);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    /**
     * 完美的打击特效
     */
    private perfectEffect(note: ToDrawEffect) {

    }

    /**
     * 好的打击特效
     */
    private goodEffect(note: ToDrawEffect) {

    }

    /**
     * miss的打击特效
     */
    private missEffect(note: ToDrawEffect) {

    }
}