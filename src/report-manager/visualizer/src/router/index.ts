import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import History from '../views/History.vue';
import Run from '../views/Run.vue';
import Event from '../views/Event.vue';
import Logs from '../views/Logs.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'History',
    component: History,
  },
  {
    path: '/run/:run',
    name: 'Run',
    component: Run,
  },
  {
    path: '/run/:run/event/:eventID',
    name: 'Event',
    component: Event,
  },
  {
    path: '/run/:run/event/:eventID/logs',
    name: 'Logs',
    component: Logs,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
