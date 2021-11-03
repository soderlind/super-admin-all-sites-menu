const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

/* Read license */
const license = fs.readFileSync("./LICENSE", "utf-8");

module.exports = {
	entry: {
		main: path.resolve(__dirname, "./src/all-sites-menu.js"),
	},
	output: {
		filename: "all-sites-menu.js",
		path: path.resolve(__dirname, "include"),
	},
	plugins: [new webpack.BannerPlugin(license)],
};
