import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "user_roles_rights" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "user_roles_rights" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "user_roles_rights" */ '../components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "goods" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "goods" */ '../components/goods/Params.vue')
const GoodsList = () => import(/* webpackChunkName: "goods" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "goods" */ '../components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order.vue')
const Edit = () => import(/* webpackChunkName: "order_report" */ '../components/order/Edit.vue')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/goods/edit/:goodsId',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/orders/edit/:id',
        component: Edit
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
