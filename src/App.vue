<template>
    <div id="header">
        <select id="mode" v-model="mode">
            <option v-for="name of modes">{{name}}</option>
        </select>
    </div>
    <hr />
    <main>
        <Graph v-if="mode === 'graph'"></Graph>
        <Animate v-if="mode === 'animate'"></Animate>
        <Time v-if="mode === 'time'"></Time>
        <Game v-if="mode === 'game'"></Game>
    </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Graph from './pages/graph.vue';
import Animate from './pages/animate.vue';
import Time from './pages/time.vue';
import Game from './pages/game.vue';

const modes = ['graph', 'animate', 'time', 'game'];
const mode = ref('game');

</script>

<style scoped lang="less">
#header {
    display: flex;
    flex-direction: column;
    align-items: center;
}

select {
    width: 200px;
    height: 40px;
    font-size: 28px;
    font-weight: 200;
}

main {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>