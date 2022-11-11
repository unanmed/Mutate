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
import { Transition } from '../../lib/transition';

// 一个动画就能测试全部的内容了
async function play() {
    console.log('准备播放');

    await sleep(1000);
    await ani();
}

async function ani() {
    const canvas = document.getElementById(
        'animate-canvas'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const tran = new Transition();
    ctx.save();

    tran.value.x = 400;
    tran.value.y = 400;

    tran.ticker.add(() => {
        ctx.beginPath();
        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, 800, 800);
        ctx.fillStyle = '#0ff';
        ctx.arc(tran.value.x, tran.value.y, 50, 0, Math.PI * 2);
        ctx.fill();
    });

    await sleep(1000);
    tran.mode(hyper('sin', 'out')).time(600).absolute();
    tran.value.x = 200;
    tran.value.y = 200;
    await sleep(200);
    tran.value.y = 600;
    await sleep(500);
    tran.value.x = 400;
    tran.time(2000);
    await tran.all();
    tran.value.x = 800;
    tran.value.x = 0;
    await sleep(700);
    tran.value.y = 200;
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
