import { createApp, watch } from 'vue'
import '@/styles/index.scss'
import App from '@/App.vue'

import { langRef } from './cesiumUtils/i18n'

const app = createApp(App)
app.mount('#app')

watch(langRef, (value) => {
  localStorage.setItem('lang', value)
  window.location.reload()
})
