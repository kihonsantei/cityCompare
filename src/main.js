import { createApp } from 'vue'
import { createPinia } from 'pinia';
import GeneralFrame from './GeneralFrame.vue'
const app=createApp(GeneralFrame);
const pinia = createPinia();
//

app.use(pinia);
app.mount('#app')
