import { Chart } from "./chart";
import { BaseNote, NoteType } from "./note";
import { has } from "./utils";

export type JudgeRes = 'perfect' | 'good' | 'miss'

export class Judger {
    /** 下一个或几个需要判定的音符 */
    toJudge: BaseNote<NoteType>[] = []
    /** 正在按住的长按音符 */
    holding: BaseNote<'hold'>[] = []
    /** 现在正在按住的键 */
    holdingKeys: number[] = []
    /** 完美的个数 */
    perfect: number = 0
    /** 好的个数 */
    good: number = 0
    /** miss的个数 */
    miss: number = 0
    /** 当前连击数 */
    combo: number = 0
    /** 最大连击数 */
    maxCombo: number = 0
    /** 提前的个数 */
    early: number = 0
    /** 过晚的个数 */
    late: number = 0
    /** 按住的手指数 */
    touching: number = 0
    /** 自动播放 */
    auto: boolean = false

    /** 谱面实例 */
    readonly chart: Chart

    constructor(chart: Chart) {
        this.chart = chart;
        document.addEventListener('keydown', this.keydown);
        document.addEventListener('keyup', this.keyup);
    }

    /**
     * 判断一个音符是否在判定区间内
     */
    inJudge(num: number): boolean {
        return num <= this.perfect + this.good + this.miss + this.toJudge.length;
    }

    /**
     * 判定音符
     */
    judge(key?: number, drag: boolean = false): void {
        if (drag === true) return this.judgeDrag();
        const note = this.toJudge.shift() as BaseNote<NoteType>;
        if (!note) return;
        if (this.toJudge.length === 0) this.next();

        // 如果时hold
        if (note.noteType === 'hold') {
            return this.judgeHold(true, note as BaseNote<'hold'>, key ?? -10);
        }

        const time = this.chart.game.time;
        const noteTime = note.noteTime;
        if (!has(noteTime)) return;

        // 判定函数
        const judge = (t: number) => {
            return time > noteTime - t && time > noteTime + t;
        }

        // 判断perfect good miss
        if (judge(note.perfectTime)) {
            note.perfect();
            this.perfect++;
            this.combo++;
        } else if (judge(note.goodTime)) {
            const t = time > note.goodTime ? 'late' : 'early'
            note.good(t);
            this[t]++;
            this.good++;
            this.combo++;
        } else if (time > noteTime - note.missTime) {
            const t = time > note.goodTime ? 'late' : 'early'
            note.miss(t);
            this[t]++;
            this.combo = 0;
        }

        // 最大连击
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    }

    /**
     * 判定长按
     */
    judgeHold(first: boolean): void
    judgeHold(first: boolean, note: BaseNote<'hold'>, key: number): void
    judgeHold(first: boolean, note?: BaseNote<'hold'>, key?: number): void {
        // 第一次按下
        if (first) {
            if (has(note)) {
                note.hold();
            } else throw new TypeError(`There is no note on judging first hold.`);
        }

        // 不是第一次按下
        if (has(note) && has(key)) { // 电脑端
            if (note.key !== key) return;
        } else { // 手机端
            const all = this.holding;
            if (all.length > this.touching) {
                const delta = all.length - this.touching;
                const notes = all.splice(0, delta);
                notes.forEach(v => v.miss('late'));
            }
        }
    }

    /**
     * 判定drag音符
     */
    judgeDrag(): void {
        // drag不存在good or miss
        this.toJudge = this.toJudge.filter(v => {
            if (v.noteType === 'drag') {
                v.perfect();
                return false;
            } else return true;
        })
    }

    /**
     * 判定miss
     */
    judgeMiss(): void {
        // 每帧都要判定
        const fn = () => {
            const all = this.toJudge;
            if (all.length === 0) this.next();
            this.toJudge = this.toJudge.filter(v => {
                if (!v.noteTime) throw new TypeError(`The note to be judge doesn't have property noteTime.`);
                if (!this.auto) {
                    if (this.chart.game.time > v.noteTime + v.missTime) {
                        v.miss('late');
                        this.late++;
                        return false;
                    }
                    return true;
                } else {
                    if (this.chart.game.time > v.noteTime) {
                        v.perfect();
                        return false;
                    }
                    return true;
                }
            });
        }

        this.chart.game.ticker.add(fn);
    }

    /**
     * 手机端的drag判定
     */
    mobileDrag(): void {
        this.chart.game.ticker.add(() => {
            if (this.chart.game.status === 'playing' && this.touching > 0) {
                this.judge(void 0, true);
            }
        });
    }

    /**
     * 获取下一个或几个需要判定的音符
     */
    private next(): void {
        const all = this.chart.notesArr;
        const start = all.find(v => has(v.noteTime));
        let i = all.findIndex(v => has(v.noteTime) && v.noteTime > (start?.noteTime as number));

        if (i === -1) i = all.length + 1;
        const to = all.splice(0, i);
        this.toJudge = to.filter(v => has(v.noteTime));
    }

    /**
     * 键盘按下时
     */
    private keydown = (e: KeyboardEvent) => {
        if (!this.holdingKeys.includes(e.keyCode)) {
            this.holdingKeys.push(e.keyCode);
            this.judge(e.keyCode);
        }
        // 还有drag不能忘
        this.judge(e.keyCode, true);
    }

    /**
     * 键盘松开时
     */
    private keyup = (e: KeyboardEvent) => {
        const i = this.holdingKeys.findIndex(v => v === e.keyCode);
        this.holdingKeys.splice(i, 1);
        this.judgeHold(false, this.holding[e.keyCode], e.keyCode);
    }

    /**
     * 触摸屏按下时
     */
    touchstart = (e: TouchEvent) => {
        this.touching++;
        this.judge();
    }

    /**
     * 触摸屏松开时
     */
    touchend = (e: TouchEvent) => {
        this.touching--;
        this.judgeHold(false);
    }
}