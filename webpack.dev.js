const common = require("./webpack.common");
const merge = require("webpack-merge");
module.exports = merge(common, {
  mode: "development",
  devTools: "eval-source-map",
  devServer: {
    watchFiles: ["./src/template.html"],
  },
});
