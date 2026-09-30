import { createApp } from './app.js';
import { registerServiceWorker } from './pwa.js';

createApp(document.querySelector('#app'));
registerServiceWorker();
