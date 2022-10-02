<template>
    <div id="time">
        <span id="time-display"></span>
        <button @click="start">开始播放</button>
        <button @click="pause">暂停</button>
        <button @click="resume">继续</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Mutate } from '../../lib/core';

const canvas = document.createElement('canvas');
const game = new Mutate(canvas);

onMounted(async () => {
    await game.load('/music/rr.mp3', '/chart/rr.mtt');

    const span = document.getElementById('time-display') as HTMLSpanElement
    game.ticker.add(() => {
        span.innerHTML = `${game.time.toFixed(2)} / ${game.ac.audio.duration.toFixed(2)}`;
    });
})

function start() {
    game.ac.play();
}

function pause() {
    game.ac.pause();
}

function resume() {
    game.ac.resume();
}
</script>

<style scoped lang="less">
#time {
    display: flex;
    flex-direction: column;
}

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

span {
    border: 1px solid black;
    font-size: 28px;
}
</style>