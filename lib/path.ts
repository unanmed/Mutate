import { TimingFn } from "./timing";

/**
 * 路径函数，输入一个0-1的数，输出一个该时刻的位置
 */
export type PathFn = (input: number) => [number, number]

/**
 * 圆形轨迹
 * @param r 半径大小
 * @param timing 半径变化函数，1表示原长，0表示半径为0
 */
export function circle(r: number, timing?: TimingFn): PathFn {
    return (input: number) => [0, 0];
}

/**
 * 贝塞尔曲线轨迹
 * @param start 起点
 * @param end 终点
 * @param cps 控制点，是[x, y]数组
 */
export function bezier(start: number, end: number, ...cps: [number, number][]): PathFn {
    return (input: number) => [0, 0];
}