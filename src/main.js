// import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

import { library } from "@fortawesome/fontawesome-svg-core";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

library.add(faXmark, faPlus, faSort, faSpinner);
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

createApp(App)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount('#app')
