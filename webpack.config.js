const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  stats: "minimal",
  devServer: {
    historyApiFallback: true,
    hot: true,
    compress: true,
    port: 3000,
    static: {
      directory: path.join(__dirname, "public"),
    },
    host: "local-ip",
    client: {
      overlay: true,
      progress: true,
      webSocketURL: "ws://0.0.0.0:8080/ws",
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".wasm"],
  },
  watchOptions: {
    ignored: [
      // i comment this because it make watcher ignore the whole directory so the hot reloader wont work cause it will consider all project folder ignored by webpack watcher i think have to use to the annoying watcher permissen deniad warrning
      //
      // path.posix.resolve(__dirname, "..", "..", "..", "..", ".."),
      path.posix.resolve(__dirname, "node_modules"),
    ],
  },
  entry: path.join(__dirname, "/src/index.js"),
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "public"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "public/index.html"),
      // favicon: "./public/favicon.ico",
      manifest: "./public/manifest.json",
    }),
    new ReactRefreshPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ca]ss$/i,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|txt)$/i,
        use: ["file-loader?name=[name].[ext]"],
      },
    ],
  },
};
