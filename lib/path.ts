import { comNum, TimingFn } from "./timing";
import { add } from './timing';

type Point = [x: number, y: number]

/**
 * 路径函数，输入一个0-1的数，输出一个该时刻的位置
 */
export type PathFn = (input: number) => Point

/**
 * 圆形轨迹
 * @param r 半径大小
 * @param n 旋转的圈数
 * @param timing 半径变化函数，1表示原长，0表示半径为0
 * @param inverse 是否翻转timing函数
 */
export function circle(r: number, n: number = 1, timing: TimingFn = x => 1, inverse: boolean = false): PathFn {
    const per = 1 / n;
    return (input) => {
        const cos = Math.cos(per * input);
        const sin = Math.sqrt(1 - cos ** 2);
        const radius = r * timing(inverse ? timing(1 - input) : timing(input));
        return [radius * cos, radius * sin];
    }
}

/**
 * 贝塞尔曲线轨迹
 * @param start 起点
 * @param end 终点
 * @param cps 控制点，是[x, y]数组
 */
export function bezier(start: Point, end: Point, ...cps: Point[]): PathFn {
    const points = [start].concat(cps);
    points.push(end);
    const all = points.length;
    const coms = Array(all).fill(0).map((v, i) => comNum(i, all));

    return (input) => {
        const x = coms.map((v, i) => {
            return v * points[i][0] * ((1 - input) ** (all - i)) * (input ** i);
        });
        const y = coms.map((v, i) => {
            return v * points[i][1] * ((1 - input) ** (all - i)) * (input ** i);
        });
        return [add(...x), add(...y)];
    }
}