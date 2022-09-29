<template>
    <div id="animate">
        <canvas id="animate-canvas" width="800" height="800"></canvas>
        <button id="play" @click="play">播放动画</button>
    </div>
</template>

<script setup lang="ts">
import { AnimationBase, sleep } from '../../lib/animate';
import { circle } from '../../lib/path';
import { hyper, linear, power, shake } from '../../lib/timing';

// 一个动画就能测试全部的内容了
async function play() {
    await sleep(1000);
    await ani();
}

async function ani() {
    const canvas = document.getElementById('animate-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const rect = new AnimationBase();
    rect.register('opacity', 1);
    ctx.save();
    const draw = () => {
        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, 800, 800);
        ctx.translate(rect.x, rect.y);
        ctx.rotate(rect.angle * Math.PI / 180);
        ctx.globalAlpha = rect.custom.opacity;
        ctx.fillRect(-30 * rect.size, -30 * rect.size, 60 * rect.size, 60 * rect.size);
    }
    rect.ticker.add(draw);
    rect.mode(linear())
        .time(1000)
        .move(400, 400)
        .mode(power(4, 'in-out'))
        .time(2000)
        .rotate(3600);
    await rect.w('move');
    rect.time(5000)
        .relative()
        .mode(hyper('sin', 'in-out'))
        .moveAs(circle(200, 5, linear()))
        .mode(shake(5, hyper('tan', 'in')), true)
        .shake(1, 0)
    await rect.all();
    await sleep(200);
    rect.mode(power(2, 'out'))
        .time(500)
        .absolute()
        .move(100, 400)
        .relative()
        .rotate(-180)
        .time(200)
        .scale(2)
    await rect.n(1);
    rect.absolute()
        .scale(1)
        .time(1000)
        .apply('opacity', 0.3)
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