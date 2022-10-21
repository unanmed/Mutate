<template>
    <div>
        <button id="start" @click="start">开始游戏</button>
        <button id="restart" @click="restart">重开</button>
        <button id="pause" @click="pause">暂停</button>
        <button id="resume" @click="resume">继续</button>
        <!-- <span id="length"></span> -->
    </div>
    <canvas id="game" width="1440" height="810"></canvas>
</template>

<script setup lang="ts">
import { create, Mutate } from '../../lib/core';

let game: Mutate;

const config = {
    noteScale: 0.7
};

async function start() {
    // const span = document.getElementById('length') as HTMLSpanElement;
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const mutate = create(canvas, config);
    mutate.setOffset(-200);
    game = mutate;
    const tasks = [
        mutate.load(
            '/src/test/music/one forgotten night.mp3',
            '/src/test/chart/ofn.mtt'
        ),
        mutate.setSound('tap', '/src/test/se/tap.wav'),
        mutate.setSound('drag', '/src/test/se/drag.wav')
    ];
    mutate.on('start', e => console.log(e));
    mutate.on('load', e => console.log(e));
    mutate.on('restart', e => console.log(e));
    mutate.on('pause', e => console.log(e));
    await Promise.all(tasks);
    mutate.start(0);
    // mutate.chart.judger.auto = true;
    mutate.renderer.on('after', e => {
        const ctx = e.ctx;
        ctx.save();
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.font = '100 24px Verdana';
        ctx.fillText(
            mutate.getScore().toString().padStart(7, '0'),
            canvas.width - 20,
            20
        );
        const combo = mutate.chart.judger.combo;
        if (combo < 3) return;
        ctx.textAlign = 'center';
        ctx.font = '100 32px Verdana';
        ctx.fillText(`${combo}`, canvas.width / 2, 20);
        ctx.font = '100 18px Verdana';
        ctx.fillText(`combo`, canvas.width / 2, 50);
        ctx.restore();
    });
    mutate.on('end', e => {
        console.log('music ended');
    });
}

async function restart() {
    await game.restart();
}

function pause() {
    game.pause();
}

function resume() {
    game.resume();
}
</script>

<style scoped lang="less">
button {
    margin: 10px;
    width: 200px;
    height: 40px;
    font-size: 28px;
    font-weight: 200;
    background-color: aquamarine;
    border: 1px solid black;
    border-radius: 5px;
}
</style>
