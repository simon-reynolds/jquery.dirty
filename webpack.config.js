const path = require('path');
module.exports = {
  entry: './dist/jquery.dirty.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'jquery.dirty.min.js',
    library: 'jquery.dirty' // to enable as object in window
  },
  mode: 'production',
  externals: {
    jquery: 'jQuery'
    // add external dependencies here
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};