import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
]

function add_route(name, path) {
  path ??= '/' + name
  routes.push(
    {
      path,
      name,
      component: () => import('../views/' + name + '.vue')
    })
}

add_route('home', '/')
add_route('connector')
add_route('estimater')
add_route('projects')
add_route('project', '/project/:project_id')
add_route('budget')

// add_route('clients')
// add_route('moves')
// add_route('moves')

add_route('table-edit', '/table/:table_name')


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
