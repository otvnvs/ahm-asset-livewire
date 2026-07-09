import { bootstrapSfcApp } from './sfcBootstrap.js';
import style from './style.css' with { type: 'css' };
document.adoptedStyleSheets = [...document.adoptedStyleSheets, style];
bootstrapSfcApp().then(({ createApp, Main, router }) => {
  const app = createApp(Main);
  if (router) app.use(router);
  app.mount('#app');
}).catch(err => console.error('App initialization failed:', err));

