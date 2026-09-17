import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

/** Dev-client is storeClient; makeRedirectUri ignores native unless we pass this explicitly. */
const ANDROID_REDIRECT_URI = 'dev.erpqalam.mobile:/oauthredirect';

export function useGoogleAuthRequest() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: androidClientId ?? undefined,
    redirectUri: ANDROID_REDIRECT_URI,
  });

  return {
    request,
    response,
    promptAsync,
    configured: Boolean(androidClientId),
  };
}
