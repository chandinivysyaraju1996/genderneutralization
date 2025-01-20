// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
