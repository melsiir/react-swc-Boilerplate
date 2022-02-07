#!/usr/bin/node
import { execSync } from "child_process";
import * as readline from "node:readline/promises";
import { createRequire } from "module";

import chalk from "chalk";
import path from "path";
import fs from "fs";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

if (process.argv.length < 3) {
  console.log("You have to provide a name to your app.");
  console.log("For example :");
  console.log("    npx melsir my-app");
  process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const git_repo = "https://github.com/melsiir/react-swc-Boilerplate";

try {
  fs.mkdirSync(projectPath);
} catch (err) {
  if (err.code === "EEXIST") {
    console.log(
      `The file ${projectName} already exist in the current directory, please give it another name.`
    );
  } else {
    console.log(error);
  }
  process.exit(1);
}

async function main() {
  try {
    console.log("Downloading files...");
    execSync(`git clone --depth 1 ${git_repo} ${projectPath}`, {
      stdio: "ignore",
    });

    process.chdir(projectPath);
    const requiree = createRequire(import.meta.url);
    const oldJson = await requiree("./package.json");
    let Appjson = {};
    Appjson.name = `${projectName}`;
    Appjson.version = "1.0.0";
    Appjson.scripts = oldJson.scripts;
    Appjson.license = "ISC";
    Appjson.dependencies = oldJson.dependencies;
    Appjson.devDependencies = oldJson.devDependencies;

    fs.writeFileSync("./package.json", JSON.stringify(Appjson, null, 2));

    const answer = await rl.question(
      `${chalk.blue(
        "choose your package manger:\n"
      )} 1- npm\n 2- pnpm\n 3- yarn\n`,
      (ans) => {
        if (isNaN(ans)) console.log("please enter valid value");
        if (ans > 3 || ans < 1)
          console.log("please enter value between 1 and 3");
      }
    );
    rl.close();
    const managerList = ["npm", "pnpm", "yarn"];
    let pkgManager = managerList[answer - 1] || "npm";
    console.log(chalk.blue("Installing dependencies..."));
    execSync(`${pkgManager} install`, {stdio: 'inherit'})
    console.log(chalk.green("\nRemoving useless files"));
    // execSync("npx rimraf ./.git");
    execSync("rm -rf ./.git");
    fs.rmSync(path.join(projectPath, "bin"), { recursive: true });

    console.log(chalk.blue(`Successfully created ${projectName} App`));
    console.log();
    console.log(`command list that you can use inside you project:`);
    console.log();
    console.log(chalk.cyan(`    ${pkgManager} run dev`));
    console.log("    Start development server");
    console.log();
    console.log(chalk.cyan(`    ${pkgManager} run build`));
    console.log("    Bundles the app into static files for production");
    console.log();
    console.log(chalk.cyan(`    ${pkgManager} run anlayze`));
    console.log(
      "    Bundles the app into static files for production and also provide graphical analysis for App"
    );
    console.log();
    console.log(chalk.blue(" Go impress the world"));
  } catch (error) {
    console.log(error);
  }
}
main();
