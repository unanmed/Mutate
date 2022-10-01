<template>
    <div id="animate">
        <canvas id="animate-canvas" width="800" height="800"></canvas>
        <button id="play" @click="play">播放动画</button>
    </div>
</template>

<script setup lang="ts">
import { AnimationBase, sleep } from '../../lib/animate';
import { bezier as bezierPath, circle } from '../../lib/path';
import { hyper, linear, power, shake, bezier } from '../../lib/timing';

// 一个动画就能测试全部的内容了
async function play() {
    await sleep(1000);
    await ani();
}

async function ani() {
    const canvas = document.getElementById('animate-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const animates = Array(20).fill(0).map(() => new AnimationBase());

    animates.forEach((v, i) => {
        v.time(0)
            .move(400 + 200 * Math.cos(Math.PI / 10 * i), 400 + 200 * Math.sin(Math.PI / 10 * i))
        v.register('r', 0);
        v.register('g', 0);
        v.register('b', 0);
        v.register('opacity', 0.2);
    });

    await sleep(1000);

    for (let i = 0; i < 20; i++) {
        const a = animates[i];
        if (i === 0) a.ticker.add(() => {
            ctx.clearRect(0, 0, 800, 800);
        });

        const draw = () => {
            ctx.globalAlpha = a.custom.opacity;
            ctx.fillStyle = `rgb(${a.custom.r * 255}, ${a.custom.g * 255}, ${a.custom.b * 255})`;
            ctx.moveTo(a.x, a.y);
            ctx.beginPath();
            ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
        a.ticker.add(draw);

        a.mode(power(3, 'in'))
            .time(2000)
            .absolute()
            .moveAs(bezierPath(
                [a.x, a.y],
                [400, 400],
                [400 + 100 * Math.cos(Math.PI / 10 * (i + 4)), 400 + 100 * Math.sin(Math.PI / 10 * (i + 4))]
            ))
            .apply('g', 0.8)
            .apply('b', 0.4)
            .apply('opacity', 1)
            .mode(shake(10, power(2, 'in')), true)
            .time(3000)
            .shake(1, 0)
    }

    await sleep(4000);

    for (let i = 0; i < 20; i++) {
        const a = animates[i];
        a.mode(bezier(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1))
            .time(10000)
            .move(400 + 400 * Math.cos(Math.PI / 10 * i), 400 + 400 * Math.sin(Math.PI / 10 * i))
            .time(3000)
            .apply('r', 1)
            .apply('g', 0)
            .apply('b', 0)
            .time(5000)
            .mode(power(2, 'out'))
            .absolute()
            .apply('opacity', 0)
    }
}

</script>

<style scoped lang="less">
button {
    width: 200px;
    height: 40px;
    font-size: 28px;
    font-weight: 200;
    background-color: aquamarine;
    border: 1px solid black;
    border-radius: 5px;
}

#animate {
    display: flex;
    flex-direction: column;
    align-items: center;
}

canvas {
    border: 1px solid black;
    margin: 10px;
}
</style>