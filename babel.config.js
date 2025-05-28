export default {
  presets: [
    ["@babel/preset-env", { targets: { node: "20" }, modules: false }],
    "@babel/preset-typescript",
  ],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./"],
        alias: {
          "@shared": "./shared",
          "@libs": "./libs",
          "@modules": "./apps/api/src/modules",
        },
        extensions: [".js", ".ts"],
      },
    ],
    ["babel-plugin-add-import-extension", { extension: "js" }],
  ],
};
