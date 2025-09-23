const sass = require("sass");
const fs = require("fs");

const result = sass.renderSync({
  file: "src/styles/App.scss",
  outFile: "src/App.css",
  sourceMap: true,
  silenceDeprecations: ["legacy-js-api"], // ẩn warning cũ
});

fs.writeFileSync("src/styles/main.css", result.css);
console.log("✅ SCSS compiled to CSS!");
