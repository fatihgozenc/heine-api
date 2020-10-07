const webpack = require("webpack");
const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require("copy-webpack-plugin");

const ts = {
	test: /\.(tsx?)$/,
	loader: "ts-loader",
	exclude: [
		[
			path.resolve(__dirname, "node_modules"),
			path.resolve(__dirname, ".serverless"),
			path.resolve(__dirname, ".webpack"),
		],
	],
	options: {
		transpileOnly: true,
		experimentalWatchApi: true,
	},
};

const ejs = {
	test: /\.ejs$/,
	loader: "ejs-loader",
	options: {
		esModule: false
	}
};

const config = {
	context: __dirname,
	mode: slsw.lib.webpack.isLocal ? "development" : "production",
	entry: slsw.lib.entries,
	devtool: slsw.lib.webpack.isLocal
		? "cheap-module-eval-source-map"
		: "source-map",
	resolve: {
		extensions: [".mjs", ".json", ".ts", ".ejs"],
		symlinks: false,
		cacheWithContext: false,
	},
	output: {
		libraryTarget: "commonjs",
		path: path.join(__dirname, ".webpack"),
		filename: "[name].js",
	},
	target: "node",
	externals: [nodeExternals()],
	module: {
		rules: [ts, ejs],
	},
	plugins: [
		new webpack.EnvironmentPlugin({
			NODE_ENV: "development",
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "./template",
					to: path.join(__dirname, ".webpack/service/template"),
				},
			],
		}),
	],
};

module.exports = config;