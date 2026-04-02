import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widget/widgetTask';
import App from './App';

// 1. Le Système enregistre d'abord la tâche d'arrière-plan pour le Widget
registerWidgetTaskHandler(widgetTaskHandler);

// 2. Ensuite, il monte l'interface graphique de l'Application Principale
registerRootComponent(App);