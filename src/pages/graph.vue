<template>
    <div v-for="i of all" id="all">
        <canvas :id="`graph-${i}`"></canvas>
        <span :id="`graph-span-${i}`"></span>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { circle, bezier as bezierP } from '../../lib/path';
import { bezier, EaseMode, hyper, inverseTrigo, linear, power, shake, trigo } from '../../lib/timing';
import { drawGraph, drawPath, drawShake } from '../test/animate';

// 生成所有的可被绘制的图像数量
const all = (2 + 1 * 3 + 3 + 2) * 4 + /* linear */ 1 + /* bezier */ 5 + /* shake */ 3 + /* path */ 8;
const mode: EaseMode[] = ['in', 'out', 'center', 'in-out'];

onMounted(() => {
    for (let j = 1; j < all + 1; j++) {
        const i = j - 1;
        const canvas = document.getElementById(`graph-${j}`) as HTMLCanvasElement;
        canvas.width = 200;
        canvas.height = 200;
        if (!canvas) throw new ReferenceError(`Use nonexistent canvas. id: ${j}`);
        const span = document.getElementById(`graph-span-${j}`) as HTMLSpanElement;
        if (i >= 0 && i <= 3) {
            drawGraph(canvas, trigo('sin', mode[i % 4]));
            span.innerHTML = `trigo sin ${mode[i % 4]}`;
        } else if (i <= 7) {
            drawGraph(canvas, trigo('sec', mode[i % 4]));
            span.innerHTML = `trigo sec ${mode[i % 4]}`;
        } else if (i <= 11) {
            drawGraph(canvas, power(2, mode[i % 4]));
            span.innerHTML = `power 2 ${mode[i % 4]}`;
        } else if (i <= 15) {
            drawGraph(canvas, power(3, mode[i % 4]));
            span.innerHTML = `power 3 ${mode[i % 4]}`;
        } else if (i <= 19) {
            drawGraph(canvas, power(4, mode[i % 4]));
            span.innerHTML = `power 4 ${mode[i % 4]}`;
        } else if (i <= 23) {
            drawGraph(canvas, hyper('sin', mode[i % 4]));
            span.innerHTML = `hyper sin ${mode[i % 4]}`;
        } else if (i <= 27) {
            drawGraph(canvas, hyper('sec', mode[i % 4]));
            span.innerHTML = `hyper sec ${mode[i % 4]}`;
        } else if (i <= 31) {
            drawGraph(canvas, hyper('tan', mode[i % 4]));
            span.innerHTML = `hyper tan ${mode[i % 4]}`;
        } else if (i <= 35) {
            drawGraph(canvas, inverseTrigo('sin', mode[i % 4]));
            span.innerHTML = `in-trigo sin ${mode[i % 4]}`;
        } else if (i <= 39) {
            drawGraph(canvas, inverseTrigo('tan', mode[i % 4]));
            span.innerHTML = `in-trigo tan ${mode[i % 4]}`;
        } else if (i === 40) {
            drawGraph(canvas, linear());
            span.innerHTML = 'linear'
        } else if (i === 41) {
            drawGraph(canvas, bezier(0.7));
            span.innerHTML = 'bezier(0.7)'
        } else if (i === 42) {
            drawGraph(canvas, bezier(0.3, 0.2));
            span.innerHTML = 'bezier(0.3, 0.2)'
        } else if (i === 43) {
            drawGraph(canvas, bezier(0.3, 0.2, 0.1));
            span.innerHTML = 'bezier(0.3, 0.2, 0.1)'
        } else if (i === 44) {
            drawGraph(canvas, bezier(0.9, 0.2, 0.3, 0.7));
            span.innerHTML = 'bezier(0.9, 0.2, 0.3, 0.7)'
        } else if (i === 45) {
            drawGraph(canvas, bezier(0.6, 1.2));
            span.innerHTML = 'bezier(0.9, 0.9, 0.9, 0.1, 0.1)'
        } else if (i === 46) {
            drawShake(canvas, shake(20, hyper('tan', 'in-out')))
            span.innerHTML = 'shake 20 hyper tan in-out'
        } else if (i === 47) {
            drawShake(canvas, shake(30, bezier(0.9, 0.9, 0.9, 0.1, 0.1)))
            span.innerHTML = 'shake 30 bezier(0.9, 0.9, 0.9, 0.1, 0.1)'
        } else if (i === 48) {
            drawShake(canvas, shake(30, power(3, 'in-out')))
            span.innerHTML = 'shake 30 power 3 in-out'
        } else if (i === 49) {
            drawPath(canvas, circle(50), true);
            span.innerHTML = 'circle 50'
        } else if (i === 50) {
            drawPath(canvas, circle(50, 3, linear()), true);
            span.innerHTML = 'circle 50 3 linear'
        } else if (i === 51) {
            drawPath(canvas, circle(50, 3, bezier(0.9, 0.2, 0.3, 0.7)), true);
            span.innerHTML = 'circle 50 3 bezier(0.9, 0.2, 0.3, 0.7)'
        } else if (i === 52) {
            drawPath(canvas, circle(50, 2, power(2, 'center'), true), true);
            span.innerHTML = 'circle 50 2 power 2 center inverse'
        } else if (i === 53) {
            drawPath(canvas, bezierP([0, 0], [150, 100], [75, 20]));
            span.innerHTML = 'bezier [0,0] [150,100] [75,20]'
        } else if (i === 54) {
            drawPath(canvas, bezierP([0, 0], [100, 200], [75, 20], [200, 30]));
            span.innerHTML = 'bezier [0,0] [100,200] [75,20] [200,30]'
        } else if (i === 55) {
            drawPath(canvas, bezierP([0, 0], [200, 0], [150, 50], [100, 200], [0, 50]));
            span.innerHTML = 'bezier'
        } else if (i === 56) {
            drawPath(canvas, bezierP([0, 0], [200, 200], [150, 50], [100, 200], [0, 50]));
            span.innerHTML = 'bezier'
        }
    }
})

</script>

<style scoped lang="less">
#all {
    display: flex;
    justify-content: space-between;
    align-items: center;
    justify-items: center;
    width: 700px;
    border: 2px solid #000;
    padding: 10px;
    margin: 5px;
}

canvas {
    border: 1px solid #000;
    width: 200px;
    height: 200px;
}

span {
    border: 1px solid #000;
    font-size: 28px;
    font-weight: 200;
    padding: 5px;
}
</style>