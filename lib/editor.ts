import axios from 'axios';
import { AnimationBaseLike } from './animate';
import { Base } from './base';
import { Camera } from './camera';
import { MTTAnimate, MutateChart } from './chart';
import { Mutate } from './core';
import { MutateEventTarget } from './event';
import { BaseNote, NoteType } from './note';
import { has } from './utils';

// 编辑模式，只负责绘制，json的生成依然依靠游戏，而不是引擎

interface EditorObjEventMap {
    select: SelectEvent;
}

interface EditorObjEvent {
    target: EditorObj<any>;
}

interface SelectEvent extends EditorObjEvent {
    type: 'select';
    to: boolean;
}

type EditorRenderer = {
    base: (e: EditorObj<Base>) => void;
    tap: (e: EditorObj<BaseNote<'tap'>>) => void;
    hold: (e: EditorObj<BaseNote<'hold'>>) => void;
    drag: (e: EditorObj<BaseNote<'drag'>>) => void;
};

class EditorObj<T> extends MutateEventTarget<EditorObjEventMap> {
    /** 动画信息 */
    readonly animate: MTTAnimate;
    /** 源对象 */
    readonly source: T;

    /** 当前音符是否被选中 */
    selected: boolean = false;

    constructor(animate: MTTAnimate, source: T) {
        super();
        this.animate = animate;
        this.source = source;
    }

    /**
     * 选中这个音符
     */
    select(): void {
        this.selected = true;
        this.dispatchSelect(true);
    }

    /**
     * 取消选中
     */
    unselect(): void {
        this.selected = false;
        this.dispatchSelect(false);
    }

    /**
     * 触发选择事件
     */
    private dispatchSelect(to: boolean): void {
        const e: SelectEvent = {
            target: this,
            type: 'select',
            to
        };
        this.dispatch('select', e);
    }
}

export class Editor {
    /** 谱面文件 */
    mtt!: MutateChart;
    /** 所有的音符 */
    notes: EditorObj<BaseNote<NoteType>>[] = [];
    /** 所有的基地 */
    bases: EditorObj<Base>[] = [];
    /** 摄像机 */
    camera!: EditorObj<Camera>;
    /** 按id排列的基地 */
    basesDict: Record<string, EditorObj<Base>> = {};

    /** 游戏实例 */
    readonly game: Mutate;
    readonly renderer: EditorRenderer = {
        tap: this.renderTap,
        drag: this.renderDrag,
        hold: this.renderHold,
        base: this.renderBase
    };

    constructor(game: Mutate) {
        this.game = game;
    }

    /**
     * 加载某个谱面文件
     * @param url 谱面文件或谱面文件路径
     */
    async load(url: string | MutateChart): Promise<void> {
        if (typeof url === 'string') {
            url = (await axios.get(url, { responseType: 'json' }))
                .data as MutateChart;
        }
        this.mtt = url;
        await this.extract();
    }

    /**
     * 绘制指定时间的内容
     * @param time 绘制的时间
     */
    renderAt(time: number): void {}

    /**
     * 解析谱面文件，生成各种实例
     */
    async extract(): Promise<void> {
        Base.cnt = 0;
        BaseNote.cnt = 0;

        await new Promise(res => {
            const bases = this.mtt.bases;

            // 基地
            for (const base of bases) {
                const b = new Base(
                    base.id,
                    this.game,
                    base.x,
                    base.y,
                    Object.values(base.r)[0],
                    base.angle
                );
                const obj = new EditorObj(
                    base.animate.sort((a, b) => a.start - b.start),
                    b
                );
                this.bases[b.num] = obj;
                this.basesDict[base.id] = obj;
                b.timeNodes.push(
                    ...(Object.entries(base.bpm).map(v => [
                        parseFloat(v[0]),
                        v[1]
                    ]) as [number, number][])
                );
                b.sort();
            }

            // 音符
            const notes = this.mtt.notes.sort((a, b) => {
                const aa = has(a.config) && has(a.config.playTime);
                const bb = has(b.config) && has(b.config.playTime);
                // @ts-ignore
                if (aa && bb) return a.config?.playTime - b.config?.playTime;
                if (aa && !bb) return -1;
                if (!aa && bb) return 1;
                return 0;
            });

            for (const n of notes) {
                const base = this.basesDict[n.base].source;
                const note = new BaseNote(n.type, base, n.config);
                this.notes[note.num] = new EditorObj(
                    n.animate.sort((a, b) => a.start - b.start),
                    note
                );
                note.timeNodes.push(
                    ...(Object.entries(n.speed).map(v => [
                        parseFloat(v[0]),
                        v[1]
                    ]) as [number, number][])
                );
                note.sort();
            }

            // 判断多押
            this.notes.forEach(v => {
                v.source.multi = this.game.chart.judger.isMulti(v.source);
            });

            const camera = this.mtt.camera;
            const c = new Camera(this.game, camera.id, this.game.ctx);
            const obj = new EditorObj(
                camera.animate.sort((a, b) => a.start - b.start),
                c
            );
            this.camera = obj;

            // 配置
            this.game.target.style.background =
                this.mtt.option.background ?? 'black';
            res('extract success.');
        });
    }

    /**
     * 从某一时刻开始播放
     * @param time 开始的时间
     */
    startAt(time: number, auto: boolean = false): void {}

    /**
     * 暂停播放
     */
    pause(): void {}

    /**
     * 移动视角
     */
    move(x: number, y: number): void {}

    /**
     * 计算特定时间的动画属性，复杂度较高，性能表现差
     * @param obj 要计算的动画
     * @param time 时间
     */
    getComputedAnimation(
        obj: Base | BaseNote<NoteType> | Camera,
        time: number
    ): AnimationBaseLike {
        let ani: MTTAnimate;
        let res: AnimationBaseLike = {
            x: 960,
            y: 540,
            size: 1,
            angle: 0,
            custom: {}
        };
        if (obj instanceof Camera) {
            ani = this.mtt.camera.animate;
            res.x = 0;
            res.y = 0;
        } else if (obj instanceof Base) {
            ani = this.mtt.bases.find(v => v.id === obj.id)!.animate;
        } else {
            ani = this.mtt.notes[obj.num].animate;
        }
        const last = ani.findIndex(v => v.start > time);
        const computed: Record<string, boolean> = {};
        // 应该倒着找，找到最后一个是absolute的，再进行计算
        for (let i = last - 1; i >= 0; i--) {
            const a = ani[i];
            const type = a.type;
            if (a.relation === 'absolute' && !computed[type]) {
                const n = this.calOneAnimate(type, ani, i, last);
                if (type === 'move' || type === 'moveAs') {
                    res.x = n.x;
                    res.y = n.y;
                    computed.move = true;
                    computed.moveAs = true;
                } else if (type === 'resize' || type === 'scale') {
                    res.size = n;
                    computed.resize = true;
                    computed.scale = true;
                } else if (type === 'rotate') {
                    res.angle = n;
                    computed.rotete = true;
                } else {
                    res.custom[type] = n;
                    computed[type] = true;
                }
            }
        }
        return res;
    }

    /**
     * 计算音符的位置（note自带的那个不能用了，那个有优化，不适用于编辑）
     * @param note 音符
     */
    private calNotePosition(
        note: BaseNote<NoteType>
    ): [number, number, number] {
        return [0, 0, 0];
    }

    /**
     * 计算基地的旋转弧度，同上
     * @param base 基地
     */
    private calBaseRad(base: Base): number {
        return 0;
    }

    /** 计算某个属性的动画值 */
    private calOneAnimate(
        type: string,
        ani: MTTAnimate,
        index: number,
        last: number
    ): any {
        // 计算动画属性的重点就在这了
    }

    private renderTap(note: EditorObj<BaseNote<'tap'>>): void {}

    private renderDrag(note: EditorObj<BaseNote<'drag'>>): void {}

    private renderHold(note: EditorObj<BaseNote<'hold'>>): void {}

    private renderNonHold(note: EditorObj<BaseNote<NoteType>>): void {}

    private renderBase(base: EditorObj<Base>): void {}
}
