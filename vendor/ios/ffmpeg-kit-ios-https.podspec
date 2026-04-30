# Same as CocoaPods trunk `ffmpeg-kit-ios-https` 6.0, but `s.source` points to a mirror:
# official arthenica/ffmpeg-kit GitHub release assets were removed after project retirement.
Pod::Spec.new do |s|
  s.name = 'ffmpeg-kit-ios-https'
  s.version = '6.0'
  s.summary = 'FFmpeg Kit iOS Https Shared Framework'
  s.description = 'Includes FFmpeg with gmp and gnutls libraries enabled.'
  s.homepage = 'https://github.com/arthenica/ffmpeg-kit'
  s.authors = { 'ARTHENICA' => 'open-source@arthenica.com' }
  s.license = {
    :type => 'LGPL-3.0',
    :file => 'ffmpegkit.xcframework/ios-arm64/ffmpegkit.framework/LICENSE',
  }
  s.platforms = { :ios => '12.1' }
  s.requires_arc = true
  s.libraries = 'z', 'bz2', 'c++', 'iconv'
  s.source = {
    :http => 'https://github.com/userkr/ffmpeg-kit/releases/download/Latest/ffmpeg-kit-https-6.0-ios-xcframework.zip',
  }
  s.ios.frameworks = %w[AudioToolbox AVFoundation CoreMedia VideoToolbox]
  s.ios.vendored_frameworks = %w[
    ffmpegkit.xcframework
    libavcodec.xcframework
    libavdevice.xcframework
    libavfilter.xcframework
    libavformat.xcframework
    libavutil.xcframework
    libswresample.xcframework
    libswscale.xcframework
  ]
end
