import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './css/common/variables.css'
import './css/common/tailwind.css'
import './css/admin/dashboard.css'
import './css/driver/driver-app.css'
import './css/passenger/passenger-app.css'

createApp(App).use(createPinia()).use(router).mount('#app')
