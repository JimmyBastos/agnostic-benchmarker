const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  plugins: [
    purgecss({
      content: [
        './src/**/*.js',
        './src/**/*.vue',
        './public/index.html'
      ]
    })
  ]
}
