const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add alias support
config.resolver.alias = {
  '@': './src',
};

module.exports = config;