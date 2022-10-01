import { AnimationBase } from "./animate";
import { Mutate } from "./core";
import { BaseNote, NoteType } from "./note";
import { has } from "./utils";

export const bases: Base[] = [];

export const baseMap: { [id: string]: Base } = {};

export class Base extends AnimationBase {
    static cnt: number = 0

    bpm: number = 100
    radius: number = 10
    readonly game: Mutate
    readonly notes: BaseNote<NoteType>[] = []
    readonly num: number = Base.cnt++
    readonly id: string
    readonly timeNodes: [number, number][] = [];

    constructor(id: string, game: Mutate) {
        super();
        this.id = id;
        this.game = game;
        // 注册动画属性
        this.register('radius', 10);
        this.register('r', 0);
        this.register('g', 0);
        this.register('b', 0);
    }

    /**
     * 向该基地添加note
     * @param note 要添加的note
     */
    addNote(note: BaseNote<NoteType>): void {
        this.notes.push(note);
    }

    /**
     * 添加速度变化节点
     * @param time 产生该变化的时间
     * @param speed 设置成的速度
     */
    addSpeedNode(time: number, speed: number): void {
        this.timeNodes.push([time, speed]);
    }

    /** 
     * 排序音符和速度节点
     */
    sort(): void {
        this.timeNodes.sort(([a], [b]) => a - b);
        this.notes.sort((a, b) => {
            if (!has(a.noteTime) || !has(b.noteTime))
                throw new TypeError(`A note without note time is appended on the base ${this.id}`);
            return a.noteTime - b.noteTime;
        });
    }

    /**
     * 设置基地的半径大小
     * @param r 要设置成的半径
     */
    setRadius(r: number): Base {
        this.apply('radius', r);
        return this;
    }

    /**
     * 设置基地颜色
     */
    rgba(r?: number, g?: number, b?: number, a?: number): Base {
        has(r) && this.apply('r', r);
        has(g) && this.apply('g', g);
        has(b) && this.apply('b', b);
        has(a) && this.apply('a', a);
        return this;
    }

    /**
     * 设置基地旋转的bpm
     * @param speed 要设置成的bpm
     */
    private setSpeed(speed: number): void {
        this.bpm = speed;
    }

    /**
     * 渲染这个基地
     * @param target 目标画布
     */
    render(target: CanvasRenderingContext2D): void {

    }
}