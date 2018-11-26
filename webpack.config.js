module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js"
    },
     "paths": {
      "@/*": ["src/*"],
      "~/*": ["src/*"],
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
}
