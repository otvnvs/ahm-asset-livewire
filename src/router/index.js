import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/home/index.vue';

const routes = [
  { path: '/', redirect: '/home'},
  { name: 'home', path: '/home', component: Home }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});
/*
router.beforeEach((to, from, next) => {
  next();
});
*/

export default router;
