module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'standard',
    'standard-react'
  ],

  rules: {
    'no-console': process.env.NODE_ENV !== 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-multi-spaces': ['warn', {
      'exceptions': {
        'Property': true,
        'VariableDeclarator': true,
        'ImportDeclaration': true
      }
    }],

    'key-spacing': ['error', {
      'align': {
        'beforeColon': true,
        'afterColon': true,
        'on': 'colon'
      }
    }]
  },

  parserOptions: {
    parser: 'babel-eslint'
  }
}
