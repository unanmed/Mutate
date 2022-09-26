import { AnimationBase } from "./animate";
import { BaseNote, NoteType } from "./note";

export class Base extends AnimationBase {
    notes: BaseNote<NoteType>[] = []
    bpm: number = 100

    constructor() {
        super();
    }

    /**
     * 向该基地添加note
     * @param note 要添加的note
     */
    addNote(note: BaseNote<NoteType>): void {

    }

    /**
     * 添加速度变化节点
     * @param time 产生该变化的时间
     * @param speed 设置成的速度
     */
    addSpeedNode(time: number, speed: number): void {

    }

    /**
     * 设置基地旋转的bpm
     * @param speed 要设置成的bpm
     */
    private setSpeed(speed: number): void {

    }

    /**
     * 渲染这个基地
     * @param target 目标画布
     */
    render(target: CanvasRenderingContext2D): void {

    }
}