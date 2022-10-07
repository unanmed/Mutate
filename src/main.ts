import { createApp } from 'vue'
import App from './App.vue'
import * as mutate from '../lib/index'

if (!AudioContext) {
    alert('浏览器版本过低，无法运行该游戏，请更新浏览器，建议使用chrome或edge浏览器');
    throw new Error('The browser is too old to run this game.');
}

createApp(App).mount('#app')