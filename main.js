import { createApp } from 'vue';
import Main from './Main.vue';
import router from './router/index.js';
import { registerServiceWorker } from './util/serviceWorker/serviceWorker.js';
import './style.css';
registerServiceWorker('/sw.js');
const app = createApp(Main);
app.use(router);
app.mount('#app');
