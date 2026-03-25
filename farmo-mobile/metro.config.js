const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('onnx');
config.resolver.sourceExts.push('wasm');

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
