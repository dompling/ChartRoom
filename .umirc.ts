import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: false,
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: false,
  styles: [{ src: '/css/msgbase.css' }],
  routes: [
    {
      name: '首页',
      path: '/',
      component: './Home',
    },
    {
      path: '/*',
      title: '404',
      layout: false,
      component: '@/pages/404.tsx',
    },
  ],
  npmClient: 'pnpm',
  define: {
    'process.env.API': 'http://43.242.202.42',
    'process.env.CACHE': 'userInfo',
  },
});
