/**
 * 渐变函数，输入0-1之间的数，输出一个0-1之间的数，说明了动画完成度，1表示结束，0表示开始
 */
export type TimingFn = (input: number) => number

/**
 * in: 慢-快
 * out: 快-慢
 * in-out: 慢-快-慢
 * center: 快-慢-快
 */
export type EaseMode = 'in' | 'out' | 'in-out' | 'center'

/**
 * 线性变化
 */
export function linear(): TimingFn {
    return (input: number) => 0;
}

/**
 * 贝塞尔曲线变化，3、4两个参数可选
 * @param cp1x 控制点1横坐标
 * @param cp1y 控制点1纵坐标
 * @param cp2x 控制点2横坐标
 * @param cp2y 控制点2纵坐标
 * @returns 
 */
export function bezier(cp1x: number, cp1y: number, cp2x?: number, cp2y?: number): TimingFn {
    return (input: number) => 0;
}

/**
 * 二次函数变化
 * @param ease 缓动方式
 */
export function quad(ease: EaseMode): TimingFn {
    return (input: number) => 0;
}

/**
 * 三角函数变化
 * @param ease 缓动方式
 */
export function trigo(mode: 'sin' | 'sec', ease: EaseMode): TimingFn {
    return (input: number) => 0;
}

/**
 * 幂函数变化
 * @param n 指数
 * @param ease 缓动方式
 */
export function power(n: number, ease: EaseMode): TimingFn {
    return (input: number) => 0;
}

/**
 * 双曲函数变化
 */
export function hyper(mode: 'sin' | 'tan' | 'sec', ease: EaseMode): TimingFn {
    return (input: number) => 0;
}

/**
 * 反三角函数变化
 */
export function inverseTrigo(mode: 'sin' | 'tan', ease: EaseMode): TimingFn {
    return (input: number) => 0;
}

/**
 * 震动变化
 * @param power 最大震动强度，该值越大最大振幅越大
 * @param timing 强度的变化函数，当其返回值为1时表示振幅达到最大值
 * @returns 震动的变化函数
 */
export function shake(power: number, timing?: TimingFn): TimingFn {
    return (input: number) => 0;
}