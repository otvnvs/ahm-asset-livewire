import { createApp } from 'vue';
import Main from './Main.vue';
import router from './router/index.js';
//import style from './style.css' with { type: 'css' };
const app = createApp(Main);
app.use(router);
app.mount('#app');
