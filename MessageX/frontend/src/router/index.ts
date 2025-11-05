import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Chat from '../components/Chat.vue';

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/Dashboard.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
