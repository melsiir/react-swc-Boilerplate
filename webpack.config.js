const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");



const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

let mode = "development"

const styleLoader = isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader;

const plugins = [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "public/index.html"),
      // favicon: "./public/favicon.ico",
      manifest: "./public/manifest.json",
    }),
  new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
]

if (isDevelopment) {
  plugins.push(new ReactRefreshPlugin())
}


if (isProduction) {
  mode = "production"
}


module.exports = {
  mode: mode,
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
    // open: true,
    client: {
      overlay: true,
      progress: true,
      // webSocketURL: "ws://0.0.0.0:8080/ws",
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
    path: isDevelopment ? path.join(__dirname, "public") : isProduction ? path.join(__dirname, 'build'): 'none' ,
  },
  plugins: plugins,

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
        include: path.resolve(__dirname, "src"),
        use: [styleLoader, "css-loader"],
      },
      {
        test: /\.s[ca]ss$/i,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src"),
        use: [styleLoader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|txt)$/i,
        // use: ["file-loader?name=[name].[ext]"],
        type: "asset",
      },
    ],
  },
  optimization: {
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      `...`,
      new CssMinimizerPlugin(),
    ],
  },

  devtool: "source-map",
};
