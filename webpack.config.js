const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./js/app.js",
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "bundle.min.js",
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "*.html" },
        { from: "*.png", noErrorOnMissing: true },
        { from: "*.jpg", noErrorOnMissing: true },
        { from: "js/LZWEncoder.js" },
        { from: "js/NeuQuant.js" },
        { from: "js/GIFEncoder.js" },
        { from: "images", to: "images" },
        { from: "examples", to: "examples" }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.(s)*css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  }
};
