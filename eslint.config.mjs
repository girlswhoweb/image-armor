import config from "eslint-config-standard";


export default [
  ...[].concat(config),
  {
    files: ["**/*.jsx"],
    ignores: ["node_modules/**", "**/node_modules/**", ".gadget"],
    rules: {
      semi: "error"
    }
  }
];