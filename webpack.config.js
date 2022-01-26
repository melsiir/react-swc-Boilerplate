const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 300,
    ignored: [
      path.posix.resolve(__dirname, "..", "..", "..", "..", ".."),
      path.posix.resolve(__dirname, "node_modules"),
    ],
  },
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "public"),
  },
  // plugins: [isDevelopment && new ReactRefreshPlugin()].filter(Boolean),
  module: {
    rules: [
      {
        loader: "swc-loader",
        test: /\.(jsx|js|ts|tsx)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],

        exclude: /node_modules/,
      },
      {
        test: /\.png|svg|jpg|gif$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
    }),
  ],
  devServer: {
    static:[ path.join(__dirname, "src"), path.join(__dirname, "public") ],
    // historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      reconnect: true,
    },
    hot: true,
    compress: true,
    port: 3000,
  },
};
