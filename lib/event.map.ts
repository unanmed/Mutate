import { Base } from "./base";
import { MutateChart } from "./chart";
import { MutateStatus } from "./core";
import { MutateEvent } from "./event";
import { JudgeRes } from "./judge";
import { BaseNote, DetailRes, NoteType } from "./note";

/**
 * 游戏实例上的事件
 */
export interface CoreEventMap {
    load: LoadEvent<'load'>
    start: StartEvent<'start'>
    restart: StartEvent<'restart'>
    pause: TriggerEvent<'pause'>
    resume: TriggerEvent<'resume'>
    end: TriggerEvent<'end'>
}

export interface LoadEvent<K extends keyof CoreEventMap> extends MutateEvent<K, CoreEventMap> {
    /** 加载时长 */
    time: number
}

export interface StartEvent<K extends keyof CoreEventMap> extends MutateEvent<K, CoreEventMap> {
    music: AudioBuffer
    mtt: MutateChart
}

export interface TriggerEvent<K extends keyof CoreEventMap> extends MutateEvent<K, CoreEventMap> {
    from: Exclude<MutateStatus, 'exit'>
    to: Exclude<MutateStatus, 'pre'> | 'win' | 'lose'
}

/**
 * 判定事件
 */
export interface JudgerEventMap extends NoteEventMap, BaseEvent {

}

/**
 * 音符上的事件
 */
export interface NoteEventMap {
    hit: HitEvent<'hit'>
    hold: HoldEvent<'hold'>
    holdend: HoldEvent<'holdend'>
}

export interface HitEvent<K extends keyof NoteEventMap> extends MutateEvent<K, NoteEventMap> {
    res: JudgeRes
    note: BaseNote<NoteType>
    base: Base
    detail: DetailRes | 'perfect'
}

export interface HoldEvent<K extends keyof NoteEventMap> extends HitEvent<K> {
    time: number
    totalTime: number
}

export interface BaseEvent {

}