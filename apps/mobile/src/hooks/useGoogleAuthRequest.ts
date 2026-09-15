import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export function useGoogleAuthRequest() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: androidClientId ?? undefined,
  });

  return {
    request,
    response,
    promptAsync,
    configured: Boolean(androidClientId),
  };
}
