"use strict";

const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const packageJSON = require("./package.json");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
  ...defaultConfig,
  module: {
    ...defaultConfig.module,
    rules: [...defaultConfig.module.rules],
  },
  optimization: {
    ...defaultConfig.optimization,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  plugins: [
    ...defaultConfig.plugins,
    new webpack.BannerPlugin({
      exclude: /\.php$/,
      banner: `${packageJSON.name}
version: ${packageJSON.version}
address: ${packageJSON.homepage}
author:  ${packageJSON.author}
license: ${packageJSON.license}`,
    }),
  ],
};
