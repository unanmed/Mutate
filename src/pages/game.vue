<template>
    <div>
        <button id="start" @click="start">开始游戏</button>
        <button id="restart" @click="restart">重开</button>
        <span id="length"></span>
    </div>
    <canvas id="game" width="1440" height="810"></canvas>
</template>

<script setup lang="ts">
import { create, Mutate } from '../../lib/core';

let game: Mutate

const config = {
    noteScale: 0.7
}

async function start() {
    const span = document.getElementById('length') as HTMLSpanElement;
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const mutate = create(canvas, config);
    mutate.setOffset(-90);
    game = mutate;
    const tasks = [
        mutate.load('/src/test/music/one forgotten night.mp3', '/src/test/chart/ofn.mtt'),
        mutate.setSound('tap', '/src/test/se/tap.wav'),
        mutate.setSound('drag', '/src/test/se/drag.wav')
    ]
    await Promise.all(tasks);
    mutate.start(0);
    mutate.chart.judger.auto = true;
    mutate.ticker.add(() => {
        span.innerHTML = `打击数：${mutate.chart.judger.perfect + mutate.chart.judger.good} / ${mutate.length}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;连击数：${mutate.chart.judger.combo}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最大连击：${mutate.chart.judger.maxCombo}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;perfect：${mutate.chart.judger.perfect}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;good：${mutate.chart.judger.good}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;miss：${mutate.chart.judger.miss}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;late：${mutate.chart.judger.late}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;early：${mutate.chart.judger.early}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;分数：${mutate.getScore()}`;
    })
}

async function restart() {
    await game.restart();
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