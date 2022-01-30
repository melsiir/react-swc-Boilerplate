const path = require("path");
const fs = require('fs')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

let mode = "development";

const styleLoader = isDevelopment
  ? "style-loader"
  : MiniCssExtractPlugin.loader;

const plugins = [
  new HtmlWebpackPlugin({
    filename: "index.html",
    inject: true,
    template: path.resolve(__dirname, "public/index.html"),
    // favicon: "./public/favicon.ico",
    manifest: "./public/manifest.json", 
  }),
  new MiniCssExtractPlugin({
    filename: "static/css/[name].[contenthash:8].css",
    chunkFilename: "static/css/[id].[contenthash:8].css",
    ignoreOrder: true, // Enable to remove warnings about conflicting order
  }),
  // new BundleAnalyzerPlugin(),
  // new CompressionPlugin()
];

const isTypeScript = fs.existsSync('./src/index.ts')
const isJavaScript = fs.existsSync('./src/index.js')



if (isDevelopment) {
  plugins.push(new ReactRefreshPlugin());
}

if (isProduction) {
  mode = "production";
  //clean only in production mode
  plugins.push(new CleanWebpackPlugin())
}


const optimize = () => {
  if (isDevelopment) return undefined;
  return {
    minimize: isProduction,
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
       cacheGroups: {
         vendor: {
           test: /[\\/]node_modules[\\/]/,
           name: 'vendors',
           chunks: 'all',
         },
       },
     },
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      `...`,
      new CssMinimizerPlugin(),
    ],

  }
}




const swcConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '.swcrc'), 'utf-8'));
swcConfig.jsc.transform.react.development = isDevelopment;
swcConfig.sourceMaps = isDevelopment;
swcConfig.minify = !isDevelopment;


// console.log(swcConfig)


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
    // proxy: {
    //   '/': {
    //     target: 'localhost:3000',
    //     secure: false,
    //   },
    // },
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  watchOptions: {
    ignored: [
      // i comment this because it make watcher ignore the whole directory so the hot reloader wont work cause it will consider all project folder ignored by webpack watcher i think have to use to the annoying watcher permissen deniad warrning // cause it targets root folder
      //
      // path.posix.resolve(__dirname, "..", "..", "..", "..", ".."),
      path.posix.resolve(__dirname, "node_modules"),
    ],
  },
  entry: path.join(__dirname, "/src/index.js"),
  output: {
    filename: isProduction ? "static/js/[name].[contenthash:8].js" :  "static/js/bundle.js",
    path: isDevelopment
      ? path.join(__dirname, "public")
      : isProduction
      ? path.join(__dirname, "build")
      : "none",
    pathinfo: isDevelopment,
    // clean: true,
  },
  plugins: plugins,

  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
          options: swcConfig,
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
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/inline',
      },
    ],
  },
  optimization: optimize(),
  // be carefull with devtool as they cost resource specialy source-map but off good debug in devtool
  // devtool: "source-map",
    devtool: 'eval-cheap-module-source-map',

};
