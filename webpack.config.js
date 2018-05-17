const path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    context: __dirname,
    mode: 'production',
    entry: ['./tools/index.js'],
    module: {
	    rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
          }
        }
      ]
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'demo/images',
            to: 'images'
        }, {
            from: 'demo/shaders',
            to: 'shaders'
        }, {
            from: 'demo/style',
            to: 'style'
        }, {
            from: 'demo/dzi/main.js',
            to: 'dzi/main.js'
        }, {
            from: 'demo/dzi/viewer.js',
            to: 'dzi/viewer.js'
        }, {
            from: 'tools/index.html',
            to: 'dzi/index.html'
        }]),
    ]
};
