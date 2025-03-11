const path = require('path');

module.exports = {
  // Extend the default Create React App webpack configuration
  webpack: {
    configure: (webpackConfig) => {
      // Find the source-map-loader rule
      const sourceMapRule = webpackConfig.module.rules.find(
        (rule) => rule.use && rule.use.some && rule.use.some((use) => use.loader && use.loader.includes('source-map-loader'))
      );

      if (sourceMapRule) {
        // Add exclude pattern for react-datepicker
        sourceMapRule.exclude = [
          /node_modules\/react-datepicker/,
        ];
      }

      return webpackConfig;
    },
  },
}; 