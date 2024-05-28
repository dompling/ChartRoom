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
  ],
  npmClient: 'pnpm',
  define: {
    'process.env.API': 'http://43.242.202.42',
    'process.env.CACHE': 'userInfo',
  },
});
