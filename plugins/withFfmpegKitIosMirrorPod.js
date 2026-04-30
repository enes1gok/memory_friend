const fs = require('fs');
const path = require('path');

const { withDangerousMod } = require('expo/config-plugins');

const MARKER = "pod 'ffmpeg-kit-ios-https', :podspec => File.join(__dir__, '..', 'vendor', 'ios', 'ffmpeg-kit-ios-https.podspec')";

/**
 * CocoaPods trunk still points ffmpeg-kit-ios-https at removed GitHub URLs (404).
 * Pin the pod to our vendored podspec, which uses a community-hosted xcframework mirror.
 */
function withFfmpegKitIosMirrorPod(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) {
        return cfg;
      }
      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (contents.includes(MARKER)) {
        return cfg;
      }
      const replaced = contents.replace(
        /(target ['"][^'"]+['"] do\n)/,
        `$1  # ffmpeg-kit: official release binaries removed; mirror podspec (vendor/ios).\n  ${MARKER}\n`,
      );
      if (replaced === contents) {
        throw new Error(
          '[withFfmpegKitIosMirrorPod] Could not find iOS target line in Podfile to inject ffmpeg-kit-ios-https override.',
        );
      }
      fs.writeFileSync(podfilePath, replaced);
      return cfg;
    },
  ]);
}

module.exports = withFfmpegKitIosMirrorPod;
