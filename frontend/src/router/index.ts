// Vue Router configuration — defines all application routes with lazy-loaded views.
// Uses a beforeEach navigation guard to enforce authentication on protected pages
// and redirect already-authenticated users away from guest-only pages.
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'trends',
          name: 'Trends',
          component: () => import('@/views/TrendsView.vue'),
        },
        {
          path: 'heatmap',
          name: 'Heatmap',
          component: () => import('@/views/HeatmapView.vue'),
        },
        {
          path: 'properties',
          name: 'Properties',
          component: () => import('@/views/PropertiesView.vue'),
        },
        {
          path: 'saved',
          name: 'Saved',
          component: () => import('@/views/SavedView.vue'),
        },
        {
          path: 'compare',
          name: 'Compare',
          component: () => import('@/views/ComparisonView.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  authStore.loadFromStorage();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
