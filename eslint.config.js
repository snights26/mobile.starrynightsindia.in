const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  { ignores: [".expo/**", "node_modules/**"] },
  ...expoConfig,
  {
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".android.tsx", ".ios.tsx", ".web.tsx"],
        },
      },
    },
  },
]);
