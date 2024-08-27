import fs from "fs";
import { execSync } from "child_process";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
packageJson.version = packageJson.version.replace("PATCH", commitHash);
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
