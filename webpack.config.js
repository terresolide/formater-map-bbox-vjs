var path = require('path')
var webpack = require('webpack')
var PACKAGE = require('./package.json');
var buildVersion = PACKAGE.version;
var buildName = PACKAGE.name;
var CleanWebpackPlugin = require('clean-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// var vueLoaderConfig = require('./vue-loader.conf')
var prodUrl = PACKAGE.production.url + '/' + buildName + '@' + buildVersion +  '/dist/' ;
var dataUrl = PACKAGE.production.url + '/' + buildName + '@' + buildVersion +  '/public/' ;
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
//if (process.env.NODE_ENV === 'production') {
//  var appURL = prodUrl;
//} else {
//  var appURL = 'dist/';
//}
var pathsToClean = [
  'dist/*.*'
]

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: buildName+'.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
//        options: {
//          loaders:  {
//            i18n: '@kazupon/vue-i18n-loader',
//            scss: 'style!css!sass'
//          }
          // other vue-loader options go here
//        }
      },
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@kazupon/vue-i18n-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
//      {
//        test: /\.s[a|c]ss$/,
//        loader: 'style!css!sass'
//      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader' /*,
          options: {
            limit: 10000,
            name: 'assets/fonts/[name].[hash:7].[ext]'
          }*/
        }]
      },
      {
          test: /\.(json)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
            loader: 'url-loader',
            options: {
              name: 'data/[name].[ext]'
            }
          }]
        },
      {
        test: /\.(png|jpeg|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/img/[name].[hash:7].[ext]'
        }
      }
//      {
//        test: /\.(png|jpg|gif|svg)$/,
//        loader: 'file-loader'
 // remove options remove warning https://github.com/webpack/loader-utils/issues/56
 //       options: {
 //         name: '/assets/images/[name].[ext]?[hash]'
 //       }
 //     }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}
module.exports.plugins = (module.exports.plugins || []).concat([
  new VueLoaderPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
        PACKAGE_VERSION: '"' + buildVersion + '"',
        DATA_URL: '"' + dataUrl + '"'
    }
  })
])

if (process.env.NODE_ENV === 'development') {
  module.exports.mode = 'development'
	module.exports.output.filename='build.js'
	  module.exports.plugins = (module.exports.plugins || []).concat([
	    new FriendlyErrorsWebpackPlugin()
	  ])


}
if (process.env.NODE_ENV === 'production') {
  module.exports.mode = 'production'
  module.exports.devtool = '#source-map';
  module.exports.output.publicPath = prodUrl;

  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([

    new CleanWebpackPlugin(pathsToClean),
    new UglifyJsPlugin({
        sourceMap: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {
        assetsSubDirectory: 'assets/'
      }
    })
  ])
}

