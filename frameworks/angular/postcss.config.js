const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  plugins: [
    purgecss({
      content: [
        './src/**/*.js',
        './src/**/*.ts',
        './src/**/*.html'
      ]
    })
  ]
}
