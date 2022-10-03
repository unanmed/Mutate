<template>
    <button id="start" @click="start">开始游戏</button>
    <canvas id="game" width="1440" height="810"></canvas>
</template>

<script setup lang="ts">
import { create } from '../../lib/core';

async function start() {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const mutate = create(canvas);
    await mutate.load('/music/rr.mp3', '/chart/rr.mtt');
    mutate.start();
    mutate.chart.judger.auto = true;
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