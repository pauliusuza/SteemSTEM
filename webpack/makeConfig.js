/* eslint-disable global-require */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const configUtils = require('./configUtils');

const DEFAULTS = {
  isDevelopment: process.env.NODE_ENV !== 'production',
  baseDir: path.resolve(__dirname, '..'),
};

const POSTCSS_LOADER = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
    plugins: () => [
      require('autoprefixer')({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9', // React doesn't support IE8 anyway
        ],
      }),
    ],
  },
};

function isVendor({ resource }) {
  return resource && resource.indexOf('node_modules') >= 0 && resource.match(/\.jsx?$/);
}

function makePlugins(options) {
  const isDevelopment = options.isDevelopment;

  let plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        NODE_ENV: isDevelopment ? JSON.stringify('development') : JSON.stringify('production'),
        ENABLE_LOGGER: JSON.stringify(process.env.ENABLE_LOGGER),
        STEEMCONNECT_CLIENT_ID: JSON.stringify(process.env.STEEMCONNECT_CLIENT_ID || 'steemstem.app'),
        STEEMCONNECT_REDIRECT_URL: JSON.stringify(
          process.env.STEEMCONNECT_REDIRECT_URL || 'http://localhost:3000/callback',
        ),
        STEEMCONNECT_HOST: JSON.stringify(
          process.env.STEEMCONNECT_HOST || 'https://steemconnect.com',
        ),
        STEEMJS_URL: JSON.stringify(process.env.STEEMJS_URL || 'https://api.steemit.com'),
        IS_BROWSER: JSON.stringify(true),
        SIGNUP_URL: JSON.stringify(process.env.SIGNUP_URL || 'https://signup.steemit.com/?ref=steemstem'),
      },
    }),
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true,
      shorthands: true,
      flattening: true,
    }),
    new Visualizer({
      filename: './statistics.html',
    }),
  ];

  if (isDevelopment) {
    plugins = plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    ]);
  } else {
    plugins = plugins.concat([
      new CleanWebpackPlugin([path.join(options.baseDir, '/public')], { allowExternal: true }),
      new CopyWebpackPlugin([
        {
          from: path.join(options.baseDir, '/assets'),
          to: path.join(options.baseDir, '/public'),
        },
      ]),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      /*
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks(module) {
          // this assumes your vendor imports exist in the node_modules directory
          return isVendor(module);
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      */
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "../css/[name].[hash].css",
        chunkFilename: "../css/[id].[hash].css"
      }),
      new HtmlWebpackPlugin({
        title: 'SteemSTEM',
        filename: '../index.html',
        template: path.join(options.baseDir, '/templates/production_index.html'),
      }),
    ]);
  }

  return plugins;
}

function makeStyleLoaders(options) {
  if (options.isDevelopment) {
    return [
      {
        test: configUtils.MATCH_CSS_LESS,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
            },
          },
          POSTCSS_LOADER,
          {
            loader: 'less-loader', options: { javascriptEnabled: true }
          },
        ],
      },
    ];
  }

  return [
    {
      test: configUtils.MATCH_CSS_LESS,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        POSTCSS_LOADER,
        {
          loader: 'less-loader', options: { javascriptEnabled: true }
        },
      ],
    },
  ];
}

function makeConfig(options = {}) {
  _.defaults(options, DEFAULTS);

  const isDevelopment = options.isDevelopment;

  return {
    mode: isDevelopment ? 'development': 'production',
    entry: {
      main: (isDevelopment
        ? [
          'webpack-hot-middleware/client?reload=true',
          'react-hot-loader/patch',
          // activate HMR for React
          'webpack/hot/only-dev-server',
          // bundle the client for hot reloading
          // only- means to only hot reload for successful updates
        ]
        : []
      ).concat([path.join(options.baseDir, 'src/client/index.js')]),
    },
    output: {
      path: path.join(options.baseDir, '/public/js'),
      filename: options.isDevelopment ? 'bundle.js' : 'busyapp-[name].[chunkhash].js',
      publicPath: '/js/',
    },
    optimization: {
      splitChunks: {
        chunks: "async",
      	minSize: 30000,
      	minChunks: 1,
      	maxAsyncRequests: 5,
      	maxInitialRequests: 3,
      	name: true,
      	cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: "all"
          },
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
      	}
      },
      runtimeChunk: true
      /*
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true // set to true if you want JS source maps
        }),
        new OptimizeCSSAssetsPlugin({})
      ]*/
    },
    plugins: makePlugins(options),
    module: {
      rules: [
        {
          test: configUtils.MATCH_JS_JSX,
          exclude: /node_modules/,
          use: (options.isDevelopment ? [{ loader: 'react-hot-loader/webpack' }] : []).concat([
            {
              loader: 'babel-loader',
            },
          ]),
        },
        {
          test: /\.(eot|ttf|woff|woff2|svg)(\?.+)?$/,
          loader: 'url-loader',
          options: {
            name: '../fonts/[name].[ext]',
            // load fonts through data-url in development
            limit: options.isDevelopment ? 5000000 : 1,
          },
        },
        {
          test: /\.png$/,
          loader: 'file-loader',
        },
        {
          test: /\.html$/,
          loader: 'html-loader',
          options: {
            removeComments: false,
          },
        },
      ].concat(makeStyleLoaders(options)),
    },
  };
}

if (!module.parent) {
  console.log(
    makeConfig({
      isDevelopment: process.env.NODE_ENV !== 'production',
    }),
  );
}

exports = module.exports = makeConfig;
exports.DEFAULTS = DEFAULTS;
exports.POSTCSS_LOADER = POSTCSS_LOADER;
exports.makeStyleLoaders = makeStyleLoaders;
