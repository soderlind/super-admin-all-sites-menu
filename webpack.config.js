const path = require("path");

module.exports = {
	entry: {
		main: path.resolve(__dirname, "./src/all-sites-menu.js"),
	},
	output: {
		filename: "all-sites-menu.js",
		path: path.resolve(__dirname, "include"),
	},
};
