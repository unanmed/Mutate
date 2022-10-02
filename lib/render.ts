import { Base } from "./base";
import { Chart } from "./chart";
import { Mutate } from "./core";
import { BaseNote, NoteType } from "./note";

export type RenderMap = {
    note: BaseNote<NoteType>
    base: Base
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

    constructor(game: Mutate) {
        this.game = game;
        this.game.chart.onExtracted = (chart) => {
            this.notes = chart.notes;
            this.bases = chart.bases;
            this.baseDict = chart.basesDict;
        }
    }

    /**
     * 渲染所有内容
     */
    render(): void {

    }

    /**
     * 设置基地的绘制函数
     */
    setBase(fn: (e: Base) => void): void {

    }

    /**
     * 设置音符的绘制函数
     */
    setNote<T extends NoteType>(type: NoteType, fn: (e: T) => void): void {

    }

    /**
     * 渲染音符
     */
    private renderNotes(): void {

    }

    /**
     * 渲染基地
     */
    private renderBases(): void {

    }
}