"use strict";

const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const packageJSON = require("./package.json");
const webpack = require("webpack");
module.exports = {
  ...defaultConfig,
  module: {
    ...defaultConfig.module,
    rules: [...defaultConfig.module.rules],
  },
  optimization: {
    ...defaultConfig.optimization,
  },
  plugins: [
    ...defaultConfig.plugins,
    new webpack.BannerPlugin(
      `${packageJSON.name}
version: ${packageJSON.version}
address: ${packageJSON.homepage}
author:  ${packageJSON.author}
license: ${packageJSON.license}`
    ),
  ],
};
