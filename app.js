import ejs from "ejs";
import fs from "fs";
import path from "path";

const templatePath = path.join(process.cwd(), "index.ejs");
const outputPath = path.join(process.cwd(), "index.html");

ejs.renderFile(templatePath, {}, (err, str) => {
  if (err) throw err;
  fs.writeFileSync(outputPath, str);
});
