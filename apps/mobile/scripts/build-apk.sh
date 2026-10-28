#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export LOCAL_RELEASE_APK=1
export EXPO_PUBLIC_API_URL=https://api.qalam-est.online/api/v1
export EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=668282267650-06s20qk9ll5bq7bqbhrmo0okrsmjshid.apps.googleusercontent.com

npx expo prebuild -p android --clean
cd android
./gradlew assembleRelease

APK="app/build/outputs/apk/release/app-release.apk"
APK_ABS="$(pwd)/${APK}"

echo ""
echo "APK: ${APK_ABS}"
echo ""
echo "Signing certificate SHA-1:"
keytool -printcert -jarfile "${APK}" | grep -E 'SHA1:|SHA-1'
