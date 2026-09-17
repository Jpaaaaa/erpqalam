import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

import App from './App';

WebBrowser.maybeCompleteAuthSession();
void SplashScreen.preventAutoHideAsync();

registerRootComponent(App);
