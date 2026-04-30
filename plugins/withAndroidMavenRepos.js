const fs = require('fs');
const path = require('path');

const { withDangerousMod } = require('expo/config-plugins');

const MARKER = '// @memory_friend/withAndroidMavenRepos';

/**
 * Injects Maven repositories required for a clean Expo prebuild Android Gradle graph:
 * - Notifee: app.notifee:core is only published inside the npm package (local Maven layout).
 * - FFmpegKit: prebuilt com.arthenica:ffmpeg-kit-* AARs were removed from Maven Central;
 *   Aliyun Central mirror still serves the coordinates used by ffmpeg-kit-react-native 6.0.x.
 *
 * CNG: android/ is generated; keep this plugin instead of relying on hand-edits only.
 */
function withAndroidMavenRepos(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const buildGradlePath = path.join(cfg.modRequest.platformProjectRoot, 'build.gradle');
      if (!fs.existsSync(buildGradlePath)) {
        return cfg;
      }

      let contents = fs.readFileSync(buildGradlePath, 'utf8');
      if (contents.includes(MARKER)) {
        return cfg;
      }

      // Idempotent with older hand-patched android/build.gradle (no marker).
      if (
        contents.includes('@notifee/react-native/android/libs') &&
        contents.includes('maven.aliyun.com/repository/central')
      ) {
        return cfg;
      }

      const anchor = 'allprojects {\n  repositories {\n';
      const pos = contents.indexOf(anchor);
      if (pos === -1) {
        throw new Error(
          '[withAndroidMavenRepos] Expected `allprojects { repositories {` in android/build.gradle; Expo template may have changed.',
        );
      }

      const injected =
        anchor +
        `    ${MARKER}
    // Notifee ships app.notifee:core only under node_modules (local Maven layout).
    exclusiveContent {
      forRepository {
        maven {
          url "$rootDir/../node_modules/@notifee/react-native/android/libs"
        }
      }
      filter {
        includeGroup 'app.notifee'
      }
    }

    // FFmpegKit retired; prebuilt AARs were removed from Maven Central. Mirror still hosts 6.0-2.
    maven { url 'https://maven.aliyun.com/repository/central' }

`;

      contents = contents.replace(anchor, injected);
      fs.writeFileSync(buildGradlePath, contents);
      return cfg;
    },
  ]);
}

module.exports = withAndroidMavenRepos;
