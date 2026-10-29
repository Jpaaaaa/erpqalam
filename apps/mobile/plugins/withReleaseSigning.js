const fs = require('fs');
const path = require('path');
const {
  createRunOncePlugin,
  withAppBuildGradle,
  withGradleProperties,
} = require('expo/config-plugins');

const GRADLE_PROPS = {
  'org.gradle.jvmargs': '-Xmx3g -XX:MaxMetaspaceSize=1g',
  'org.gradle.workers.max': '2',
};

function upsertGradleProperty(items, key, value) {
  const existing = items.find(
    (item) => item.type === 'property' && item.key === key,
  );
  if (existing) {
    existing.value = value;
  } else {
    items.push({ type: 'property', key, value });
  }
}

function loadReleaseCredentials(projectRoot) {
  const credPath = path.join(projectRoot, 'credentials.json');
  if (!fs.existsSync(credPath)) {
    return null;
  }

  const raw = JSON.parse(fs.readFileSync(credPath, 'utf8'));

  if (raw.android?.keystore) {
    return raw.android.keystore;
  }

  if (raw.keystorePath) {
    return raw;
  }

  throw new Error(
    '[withReleaseSigning] credentials.json exists but has no android.keystore or flat keystorePath',
  );
}

function escapeGradleString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function injectReleaseSigning(contents, projectRoot, cred) {
  const keystoreAbs = path.resolve(projectRoot, cred.keystorePath);
  if (!fs.existsSync(keystoreAbs)) {
    throw new Error(
      `[withReleaseSigning] keystore not found at ${keystoreAbs}`,
    );
  }

  const keystoreRel = path
    .relative(path.join(projectRoot, 'android', 'app'), keystoreAbs)
    .replace(/\\/g, '/');

  const releaseBlock = `
        release {
            storeFile file('${keystoreRel}')
            storePassword '${escapeGradleString(cred.keystorePassword)}'
            keyAlias '${escapeGradleString(cred.keyAlias)}'
            keyPassword '${escapeGradleString(cred.keyPassword)}'
        }`;

  let next = contents.replace(
    /\n\s*release\s*\{\s*\n\s*storeFile[\s\S]*?\n\s*\}\s*/g,
    '\n',
  );

  if (!/\brelease\s*\{[\s\S]*?storeFile/.test(next)) {
    next = next.replace(
      /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\}\s*)/,
      `$1${releaseBlock}\n    `,
    );
  }

  next = next.replace(
    /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
    '$1signingConfig signingConfigs.release',
  );

  return next;
}

function withReleaseSigning(config) {
  config = withGradleProperties(config, (config) => {
    for (const [key, value] of Object.entries(GRADLE_PROPS)) {
      upsertGradleProperty(config.modResults, key, value);
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    const projectRoot = config.modRequest.projectRoot;
    let cred;

    try {
      cred = loadReleaseCredentials(projectRoot);
    } catch (err) {
      console.warn(String(err.message ?? err));
      return config;
    }

    if (!cred) {
      console.warn(
        '[withReleaseSigning] credentials.json not found — release will use debug keystore',
      );
      return config;
    }

    for (const field of [
      'keystorePath',
      'keystorePassword',
      'keyAlias',
      'keyPassword',
    ]) {
      if (!cred[field]) {
        throw new Error(
          `[withReleaseSigning] credentials.json missing keystore.${field}`,
        );
      }
    }

    config.modResults.contents = injectReleaseSigning(
      config.modResults.contents,
      projectRoot,
      cred,
    );
    return config;
  });

  return config;
}

module.exports = createRunOncePlugin(
  withReleaseSigning,
  'withReleaseSigning',
  '1.0.0',
);
