import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import './assets/main.css'

import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'

const pinia = createPinia()

createApp(App).use(pinia).use(FloatingVue).mount('#app')
