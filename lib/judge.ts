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

    /** 连击数 */
    private c: number = 0

    set combo(v: number) {
        this.c = v;
        if (v > this.maxCombo) this.maxCombo = v;
    }

    get combo(): number {
        return this.c;
    }

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
     * @param key 记录长按按键的keycode
     */
    judge(key?: number): void {
        if (this.auto) return;
        const note = this.toJudge.slice(0, 1)[0] as BaseNote<NoteType>;
        if (!has(note)) return;
        if (this.toJudge.length === 0) this.next();

        // 如果时hold
        if (note.noteType === 'hold') {
            return this.judgeHold(true, note as BaseNote<'hold'>, key ?? -10);
        }

        if (note.noteType === 'drag') return;

        const time = this.chart.game.time;
        const noteTime = note.noteTime;
        if (!has(noteTime)) return;

        // 判定函数
        const judge = (t: number) => {
            return time > noteTime - t && time < noteTime + t;
        }

        // 判断perfect good miss
        if (judge(note.perfectTime)) {
            this.toJudge.shift();
            note.perfect();
            this.perfect++;
            this.combo++;
        } else if (judge(note.goodTime)) {
            this.toJudge.shift();
            const t = time > note.goodTime ? 'late' : 'early';
            note.good(t);
            this[t]++;
            this.good++;
            this.combo++;
        } else if (time > noteTime - note.missTime) {
            this.toJudge.shift();
            const t = time > note.goodTime ? 'late' : 'early';
            note.miss(t);
            this[t]++;
            this.combo = 0;
            this.miss++;
        }
    }

    /**
     * 判定长按
     */
    judgeHold(first: boolean): void
    judgeHold(first: boolean, note: BaseNote<'hold'>, key: number): void
    judgeHold(first: boolean, note?: BaseNote<'hold'>, key?: number): void {
        if (this.auto) return;
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
     * 判定miss drag，以及autoplay
     */
    judgeMissAndDrag(): void {
        // 每帧都要判定
        const fn = () => {
            const all = this.toJudge;
            if (all.length === 0) this.next();
            this.toJudge = this.toJudge.filter(v => {
                if (!has(v.noteTime)) throw new TypeError(`The note to be judge doesn't have the property 'noteTime'.`);
                if (!this.auto) {
                    if (v.noteType === 'drag') {
                        if (this.chart.game.time > v.noteTime - v.perfectTime) {
                            if (this.holdingKeys.length > 0 || this.touching > 0) {
                                v.perfect();
                                return false;
                            }
                        }
                    }
                    if (this.chart.game.time > v.noteTime + v.missTime) {
                        v.miss('late');
                        this.late++;
                        this.miss++;
                        return false;
                    }
                    return true;
                } else {
                    if (this.chart.game.time > v.noteTime) {
                        v.perfect();
                        this.perfect++;
                        this.combo++;
                        return false;
                    }
                    return true;
                }
            });
        }

        this.chart.game.ticker.add(fn);
    }

    /**
     * 判断是否多压
     */
    isMulti(note: BaseNote<NoteType>): boolean {
        if (!has(note.noteTime)) return false;
        const num = note.num;

        const l = this.chart.notes[num - 1];
        if (has(l) && has(l.noteTime) && l.noteTime === note.noteTime) return true;

        const n = this.chart.notes[num + 1];
        if (has(n) && has(n.noteTime) && n.noteTime === note.noteTime) return true;

        return false;
    }

    /**
     * 获取下一个或几个需要判定的音符
     */
    private next(): void {
        const all = this.chart.notesArr;
        const start = all.find(v => has(v.noteTime));
        let i = all.findIndex(v => {
            return has(v.noteTime) && (v.noteTime > (start?.noteTime as number) ||
                // 如果有间距极短的drag（一般是超过1s 60个的），就需要单独判定打击时间了
                (v.noteType === 'drag' && v.noteTime < this.chart.game.time));
        });

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