import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/login'
import Home from '@/views/home'
import User from '@/views/User'
import Right from '@/views/Right'
import Role from '@/views/Role'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '/users',
          name: 'users',
          component: User
        },
        {
          path: '/right',
          name: 'right',
          component: Right
        },
        {
          path: '/role',
          name: 'role',
          component: Role
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})
