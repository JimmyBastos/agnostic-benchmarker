const path = require('path')

module.exports = {
  entry: './src/index.ts',
  mode: process.env.NODE_ENV,
  target: "node",
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }],

    noParse: /lighthouse/
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '~': path.resolve(__dirname, 'src'),
      'modules': path.resolve(__dirname, 'node_modules')
    },
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  }
}
