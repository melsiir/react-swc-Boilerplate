console.time("a");
const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const createEnviromentHash = require("./utils/createEnviromentHash");
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
const isAnalyze = process.env.NODE_ENV === "analyze";
const joinPath = (...paths) => path.join(__dirname, ...paths);
const isTypeScript = fs.existsSync("./src/index.tsx");
const isTailwind = fs.existsSync(joinPath("tailwind.config.js"));
const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
);
console.time("b");

let mode = "development";
const ts = joinPath("src", "index.tsx");
const js = joinPath("src", "index.js");
// style files regexes
const cssRegex = /\.css$/i;
const cssModuleRegex = /\.module\.css$/i;
const sassRegex = /\.(scss|sass)$/i;
const sassModuleRegex = /\.module\.(scss|sass)$/i;

const styleLoader = isDevelopment
  ? "style-loader"
  : MiniCssExtractPlugin.loader;

const cssLoader = (isModule) => {
  const css = {
    loader: "css-loader",
    options: {
      sourceMap: isDevelopment,
      importLoaders: 1,
      modules: !isModule
        ? "global"
        : {
            auto: true,
            localIdentName: isDevelopment
              ? "[name]__[local]__[contenthash:base64:5]"
              : "[contenthash:base64:5]",
            exportLocalsConvention: "camelCase",
            // exportOnlyLocals: !isWeb,
          },
    },
  };
  return css;
};

console.log(cssLoader(false))
const postcssLoader = {
  // Options for PostCSS as we reference these options twice
  // Adds vendor prefixing based on your specified browser support in
  // package.json
  loader: require.resolve("postcss-loader"),
  options: {
    postcssOptions: {
      // Necessary for external CSS imports to work
      // https://github.com/facebook/create-react-app/issues/2677
      ident: "postcss",
      config: false,
      plugins: !isTailwind
        ? [
            "postcss-flexbugs-fixes",
            [
              "postcss-preset-env",
              {
                autoprefixer: {
                  flexbox: "no-2009",
                },
                stage: 3,
              },
            ],
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            "postcss-normalize",
          ]
        : [
            "tailwindcss",
            "postcss-flexbugs-fixes",
            [
              "postcss-preset-env",
              {
                autoprefixer: {
                  flexbox: "no-2009",
                },
                stage: 3,
              },
            ],
          ],
    },
    sourceMap: isProduction ? false : isDevelopment,
  },
};

const plugins = [
  new HtmlWebpackPlugin({
    filename: "index.html",
    inject: true,
    template: path.resolve(__dirname, "public/index.html"),
    favicon: "./public/favicon.ico",
    manifest: "./public/manifest.json",
    minify: isProduction
      ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        }
      : {},
  }),
  new MiniCssExtractPlugin({
    filename: "static/css/[name].[contenthash:8].css",
    chunkFilename: "static/css/[id].[contenthash:8].css",
    ignoreOrder: true, // Enable to remove warnings about conflicting order
  }),
  // new CompressionPlugin()
];

if (isDevelopment) {
  plugins.push(new ReactRefreshPlugin());
}

if (isProduction || isAnalyze) {
  mode = "production";
  //clean only in production mode
  plugins.push(new CleanWebpackPlugin());
}

if (isAnalyze) {
  plugins.push(new BundleAnalyzerPlugin());
}

const optimize = () => {
  if (isDevelopment) return undefined;
  return {
    minimize: isProduction,
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      enforceSizeThreshold: 50000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    },
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      `...`,
      new CssMinimizerPlugin(),
    ],
  };
};

const swcConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, ".swcrc"), "utf-8")
);
swcConfig.jsc.parser = isTypeScript
  ? {
      syntax: "typescript",
      tsx: true,
      decorators: true,
      dynamicImport: true,
    }
  : {
      syntax: "ecmascript",
      jsx: true,
    };
swcConfig.jsc.transform.react.development = isDevelopment;
swcConfig.sourceMaps = isDevelopment;
swcConfig.minify = !isDevelopment;
swcConfig.jsc.minify = isDevelopment
  ? {}
  : {
      compress: {
        unused: true,
      },
      mangle: true,
    };

console.log(swcConfig);

const registerShutdown = (fn) => {
  let run = false;

  const wrapper = () => {
    if (!run) {
      run = true;
      fn();
    }
  };

  process.on("SIGINT", wrapper);
  process.on("SIGTERM", wrapper);
  process.on("exit", wrapper);
};

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
  entry: isTypeScript ? ts : js,
  output: {
    filename: isDevelopment
      ? "static/js/bundle.js"
      : "static/js/[name].[contenthash:8].js",
    path: isDevelopment
      ? path.join(__dirname, "public")
      : path.join(__dirname, "build"),
    pathinfo: isDevelopment,
    // clean: true,
  },
  plugins: plugins,

  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        include: path.resolve(__dirname, "src"),
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
          options: swcConfig,
        },
      },
      {
        test: cssRegex,
        exclude: [sassRegex, /node_modules/],
        include: path.resolve(__dirname, "src"),
        use: [styleLoader, cssLoader(false), postcssLoader],
      },
      {
        test: cssModuleRegex,
                exclude: /node_modules/,
                include: path.resolve(__dirname, "src"),

                use: [styleLoader, cssLoader(true), postcssLoader],

      },
      {
        test: sassRegex,
        exclude: [ sassModuleRegex, /node_modules/ ],
        include: path.resolve(__dirname, "src"),
        use: [styleLoader, cssLoader(false), "sass-loader", postcssLoader],
      },
      {
        test: sassModuleRegex,
                exclude: /node_modules/,
                include: path.resolve(__dirname, "src"),
                use: [styleLoader, cssLoader(true), "sass-loader", postcssLoader],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve("@svgr/webpack"),
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
          {
            loader: require.resolve("file-loader"),
            options: {
              name: "static/media/[name].[hash].[ext]",
            },
          },
        ],
        issuer: {
          and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
        },
      },
      {
        test: [/\.avif$/],
        type: "asset",
        mimetype: "image/avif",
        parser: {
          dataUrlCondition: {
            maxSize: imageInlineSizeLimit,
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico|txt)$/i,
        // use: ["file-loader?name=[name].[ext]"],
        type: "asset/resource",
        parser: {
          dataUrlCondition: {
            maxSize: imageInlineSizeLimit,
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/inline",
      },
    ],
  },
  cache: {
    type: "filesystem",
    version: createEnviromentHash(process.env.NODE_ENV),
    cacheDirectory: joinPath(".cache"),
    store: "pack",
    buildDependencies: {
      defaultWebpack: ["webpack/lib/"],
      config: [__filename],
    },
  },
  optimization: optimize(),
  // be carefull with devtool as they cost resource specialy source-map but off good debug in devtool
  // devtool: "source-map",
  devtool: "eval-cheap-module-source-map",
};

registerShutdown(() => {
  process.on("SIGINT", () => {
    devServer.close();
    process.exit(0);
  });
});

console.timeEnd("b");
console.timeEnd("a");
