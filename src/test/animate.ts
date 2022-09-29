import { PathFn } from "../../lib/path";
import { TimingFn } from "../../lib/timing";

// Test function for timing functions
export function drawGraph(ele: HTMLCanvasElement, timing: TimingFn): void {
    const ctx = ele.getContext('2d') as CanvasRenderingContext2D;
    // ele 强制 200*200
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#33f';
    ctx.clearRect(0, 0, ele.width, ele.height);
    ctx.moveTo(0, 200);
    for (let x = 0; x < 201; x++) {
        const n = x / 200;
        const y = timing(n) * 200;
        ctx.lineTo(x, 200 - y);
    }
    ctx.stroke();
}

// Test function for shake functions
export function drawShake(ele: HTMLCanvasElement, shake: TimingFn): void {
    const ctx = ele.getContext('2d') as CanvasRenderingContext2D;
    // ele 强制 200*200
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#33f';
    ctx.clearRect(0, 0, ele.width, ele.height);
    ctx.moveTo(0, 100);
    for (let x = 0; x < 101; x++) {
        const n = x / 100;
        const y = shake(n) + 100;
        ctx.lineTo(x * 2, y);
    }
    ctx.stroke();
}

// Test function for path functions
export function drawPath(ele: HTMLCanvasElement, path: PathFn, alignCenter: boolean = false): void {
    const ctx = ele.getContext('2d') as CanvasRenderingContext2D;
    const [ox, oy] = alignCenter ? [100, 100] : [0, 0];
    // ele 强制 200*200
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#33f';
    ctx.clearRect(0, 0, ele.width, ele.height);
    const [fx, fy] = path(0);
    ctx.moveTo(fx + ox, fy + oy);
    for (let x = 0; x < 1001; x++) {
        const n = x / 1000;
        const [px, py] = path(n);
        ctx.lineTo(px + ox, py + oy);
    }
    ctx.stroke();
}