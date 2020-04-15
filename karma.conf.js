module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    files: [
      './test/*.js'
    ],
    frameworks: ['mocha', 'chai', 'sinon'],
    preprocessors: {
      './test/*.js': ['webpack']
    },
    reporters: ['mocha', 'coverage'],
    webpack: {
      module: {
        rules: [
          { test: /\.js/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
      },
      watch: true,
      mode: 'none'
    },
    webpackServer: {
      noInfo: true
    },
    singleRun: true,
    coverageReporter: {
      includeAllSources: true,
      dir: 'coverage/',
      reporters: [
        { type: "html", subdir: "html" },
        { type: 'text-summary' }
      ]
    }
  });
};