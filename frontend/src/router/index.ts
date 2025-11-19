import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import ChatEnhanced from '../components/ChatEnhanced.vue';
import ChatBubbleTest from '../components/ChatBubbleTest.vue';

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatEnhanced,
    meta: { requiresAuth: true }
  },
  {
    path: '/test-bubbles',
    name: 'ChatBubbleTest',
    component: ChatBubbleTest,
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route guard for authentication
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Wait for auth initialization if not already done
  if (!userStore.currentUser && localStorage.getItem('userId')) {
    await userStore.initializeAuth();
  }

  const isAuthenticated = userStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route without authentication
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    // Redirect to chat if already authenticated and trying to access login/register
    next('/chat');
  } else {
    next();
  }
});

export default router;
