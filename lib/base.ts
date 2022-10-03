import { AnimationBase } from "./animate";
import { Mutate } from "./core";
import { BaseNote, NoteType } from "./note";
import { has } from "./utils";

export const bases: Base[] = [];

export const baseMap: { [id: string]: Base } = {};

export class Base extends AnimationBase {
    static cnt: number = 0

    /** 基地旋转速度，一拍一圈 */
    bpm: number = 100
    /** 上一个时间节点 */
    lastNode: number = -1
    /** 上一个时间节点时的角度 */
    lastAngle: number = 0
    /** 当前旋转弧度，不计算动画旋转的角度 */
    rad: number = 0;

    /** 游戏实例 */
    readonly game: Mutate
    /** 在这个基地上的音符 */
    readonly notes: BaseNote<NoteType>[] = []
    /** 专属id */
    readonly num: number = Base.cnt++
    /** 字符串id */
    readonly id: string
    /** 速度节点 */
    readonly timeNodes: [number, number][] = [];
    /** 初始角度 */
    readonly initAngle: number

    constructor(id: string, game: Mutate, x: number, y: number, r: number, a: number) {
        super();
        this.id = id;
        this.game = game;
        // 注册动画属性
        this.register('radius', r);
        this.register('r', 255);
        this.register('g', 180);
        this.register('b', 32);
        this.register('a', 1);
        this.ox = x;
        this.oy = y;
        this.initAngle = a;
    }

    /**
     * 向该基地添加note
     * @param note 要添加的note
     */
    addNote(note: BaseNote<NoteType>): void {
        this.notes.push(note);
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
    setSpeed(speed: number): void {
        this.bpm = speed;
    }

    /**
     * 计算旋转的弧度
     */
    calRad(): number {
        this.checkNode();
        const [time, speed] = this.timeNodes[this.lastNode];

        return this.rad = this.lastAngle +
            (this.game.time - time) * speed / 30000 * Math.PI +
            this.initAngle * Math.PI / 180;
    }

    /**
     * 检查速度节点
     */
    private checkNode(): void {
        const now = this.game.time;
        let needCal = false;
        // 检查是否需要更新节点
        for (let i = this.lastNode + 1; i < this.timeNodes.length; i++) {
            const [time] = this.timeNodes[i];

            if (time < now) {
                this.lastNode = i;
                needCal = true;
            }
        }

        // 然后计算弧度
        if (needCal) {
            let res = 0;
            for (let i = 0; i < this.lastNode; i++) {
                const [time, speed] = this.timeNodes[i];
                const next = this.timeNodes[i + 1]?.[0] ?? 0;
                res += (next - time) * speed / 30000 * Math.PI;
            }
            this.lastAngle = res;
        }
    }
}