const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

/**
 *
 * @param {*} webpackConfigEnv
 * @param {*} argv
 * @returns {import('webpack').Configuration}
 */
module.exports = (webpackConfigEnv, argv) => {
  const isProd = webpackConfigEnv.prod;

  return {
    entry: path.resolve(process.cwd(), "frontend/Entry.tsx"),
    output: {
      path: path.resolve(process.cwd(), "dist"),
      filename: isProd
        ? "baseplate-web-app.[contenthash].js"
        : "baseplate-web-app.js",
    },
    mode: "development",
    devtool: "source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              // lodash'es deburrLetter function has unicode chars that don't work in all browsers yet
              // https://github.com/terser/terser/issues/1005#issuecomment-904213337
              ascii_only: true,
            },
          },
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: {
                plugins: [
                  !isProd && require.resolve("react-refresh/babel"),
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
          include: [path.join(__dirname, "frontend"), /node_modules/],
        },
        {
          test: [
            /\.eot$/,
            /\.ttf$/,
            /\.svg$/,
            /\.woff$/,
            /\.woff2$/,
            /\.bmp$/,
            /\.gif$/,
            /\.jpe?g$/,
            /\/.png$/,
          ],
          type: "asset/resource",
        },
        {
          test: /\.mdx?$/,
          use: [
            {
              loader: require.resolve("@mdx-js/loader"),
              /** @type {import('@mdx-js/loader').Options} */
              options: {},
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProd ? "[name].[contenthash].css" : "[name].css",
      }),
      new WebpackManifestPlugin({
        fileName: "webpack-manifest.json",
        publicPath: "",
      }),
      new ForkTsCheckerWebpackPlugin(),
      !isProd && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      client: {
        webSocketURL: "ws://localhost:7700/ws",
      },
    },
  };
};
