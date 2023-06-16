/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  tabWidth: 2,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 120
};

module.exports = config;
