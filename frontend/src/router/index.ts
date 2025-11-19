import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { secureStorage } from '../services/secureStorage';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Chat from '../components/Chat.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
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
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route guard for authentication
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  try {
    // Wait for auth initialization if not already done
    if (!userStore.isAuthReady) {
      const userId = await secureStorage.getItem('userId');
      if (!userStore.currentUser && userId) {
        await userStore.initializeAuth(userId);
      }
    }
  } catch (error) {
    console.error('Router auth check failed:', error);
  } finally {
    userStore.setAuthReady(true);
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
