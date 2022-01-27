const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  stats: "minimal",
  devServer: {
    historyApiFallback: true,
    hot: true,
    compress: true,
    port: 3000,
    static: {
      directory: path.join(__dirname, "public"),
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".wasm"],
  },
    watchOptions: {
    ignored: [
      // path.posix.resolve(__dirname, "..", "..", "..", "..", ".."),
      path.posix.resolve(__dirname, "node_modules"),
    ],
  },
  entry: path.join(__dirname, '/src/index.js'),
  output: {
        filename: "bundle.js",
    path: path.join(__dirname, "public"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, "public/index.html"),
      // favicon: "./public/favicon.ico",
      manifest: "./public/manifest.json",
    }),
    new ReactRefreshPlugin()
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
        exclude:/node_modules/,
        use:[
          "style-loader",
          "css-loader",
        ]
      },
      {
        test: /\.s[ca]ss$/i,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader'],

      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|txt)$/i,
        use: ['file-loader?name=[name].[ext]'],
      },
    ],
  },
}
