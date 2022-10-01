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

export type TimingGenerator = (...args: any) => TimingFn

/** 求积 */
export const multi = (...m: number[]) => m.reduce((pre, v) => pre * v, 0);

/** 求和 */
export const add = (...n: number[]) => n.reduce((pre, v) => pre + v, 0);

/** 阶乘 */
export const factorial = (n: number) => {
    if (n === 0) return 1;
    let res = n;
    while (n > 1) {
        n--;
        res *= n;
    }
    return res;
}

/** 组合数，C_n^m */
export const comNum = (m: number, n: number) => Math.round(factorial(n) / (factorial(m) * factorial(n - m)));

/** 根据mode输出对应缓动模式下的缓动函数 */
const toEase = (mode: EaseMode, ein: TimingFn, eout: TimingFn = x => 1 - ein(1 - x)): TimingFn => {
    if (mode === 'in') return ein;
    else if (mode === 'out') return eout;
    else if (mode === 'in-out') return (input) => {
        if (input < 0.5) return ein(input * 2) / 2;
        else return 0.5 + eout((input - 0.5) * 2) / 2;
    }
    else return (input) => {
        if (input < 0.5) return eout(input * 2) / 2;
        else return 0.5 + ein((input - 0.5) * 2) / 2;
    }
}

/** cosh(2) */
const cosh2 = Math.cosh(2);

/** acosh(2) = asech(0.5) */
const acosh2 = Math.acosh(2);

/** tanh(3) */
const tanh3 = Math.tanh(3);

/** atan(5) */
const atan5 = Math.atan(5);

/**
 * 线性变化
 */
export function linear(): TimingFn {
    return (input: number) => input;
}

/**
 * 贝塞尔曲线变化，起点0，终点1
 * @param cps 所有的控制点纵坐标，数量需要大于等于1，范围0-1
 * @returns 
 */
export function bezier(...cps: number[]): TimingFn {
    const points = [0].concat(cps);
    points.push(1);

    const all = points.length;
    const coms = Array(all).fill(0).map((v, i) => {
        return comNum(i, all - 1);
    });

    return t => {
        // 公式在百度上就能查到
        const arr = coms.map((v, i) => {
            return v * points[i] * ((1 - t) ** (all - i - 1)) * (t ** i);
        })
        return add(...arr);
    };
}

/**
 * 三角函数变化
 * @param ease 缓动方式
 */
export function trigo(mode: 'sin' | 'sec', ease: EaseMode): TimingFn {
    if (mode === 'sin') {
        const eout = (input: number) => Math.sin(input * Math.PI / 2);
        const ein = (input: number) => 1 - eout(1 - input);
        return toEase(ease, ein, eout);
    }
    if (mode === 'sec') {
        /** 正割 */
        const sec = (x: number) => 1 / Math.cos(x);
        // sec(PI / 3) = 2
        const ein = (input: number) => sec(input * Math.PI / 3) - 1;
        return toEase(ease, ein);
    }
    throw new TypeError(`Unexpected parameters are delivered in trigo timing function.`);
}

/**
 * 幂函数变化
 * @param n 指数
 * @param ease 缓动方式
 */
export function power(n: number, ease: EaseMode): TimingFn {
    if (!Number.isInteger(n))
        throw new TypeError(`The first parameter of power timing function only allow integer.`);
    const ein = (input: number) => input ** n;
    return toEase(ease, ein);
}

/**
 * 双曲函数变化
 */
export function hyper(mode: 'sin' | 'tan' | 'sec', ease: EaseMode): TimingFn {
    if (mode === 'sin') {
        const ein = (input: number) => (Math.cosh(input * 2) - 1) / (cosh2 - 1);
        return toEase(ease, ein);
    }
    if (mode === 'tan') {
        const eout = (input: number) => Math.tanh(input * 3) * 1 / tanh3;
        const ein = (input: number) => 1 - eout(1 - input);
        return toEase(ease, ein, eout);
    }
    if (mode === 'sec') {
        const sech = (x: number) => 1 / Math.cosh(x);
        const ein = (input: number) => 1 - (sech(input * acosh2) - 0.5) * 2;
        return toEase(ease, ein);
    }
    throw new TypeError(`Unexpected parameters are delivered in hyper timing function.`)
}

/**
 * 反三角函数变化
 */
export function inverseTrigo(mode: 'sin' | 'tan', ease: EaseMode): TimingFn {
    if (mode === 'sin') {
        const eout = (input: number) => Math.asin(input) / Math.PI * 2;
        const ein = (input: number) => 1 - eout(1 - input);
        return toEase(ease, ein, eout);
    }
    if (mode === 'tan') {
        const eout = (input: number) => Math.atan(input * 5) / atan5;
        const ein = (input: number) => 1 - eout(1 - input);
        return toEase(ease, ein, eout);
    }
    throw new TypeError(`Unexpected parameters are delivered in inverse trigo timing function.`)
}

/**
 * 震动变化
 * @param power 最大震动强度，该值越大最大振幅越大
 * @param timing 强度的变化函数，当其返回值为1时表示振幅达到最大值
 * @returns 震动的变化函数
 */
export function shake(power: number, timing: TimingFn = () => 1): TimingFn {
    let n = -1;
    return (input) => {
        n *= -1;
        if (input < 0.5) {
            const p = power * timing(input * 2);
            return p * n;
        } else {
            const p = power * timing((1 - input) * 2);
            return p * n;
        }
    }
}