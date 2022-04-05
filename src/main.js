import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import key_db from './plugins/key-db-api'
import utils from './plugins/utils'

Vue.config.productionTip = false

Vue.use(key_db)
Vue.use(utils)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
