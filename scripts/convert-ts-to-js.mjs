#!/usr/bin/env node
import { transformAsync } from "@babel/core";
import fs from "fs-extra";
import { sync as globSync } from "glob";
import path from "path";

async function convertFile(file) {
  const ext = path.extname(file);
  const isTsx = ext === ".tsx";
  const code = await fs.readFile(file, "utf8");
  const result = await transformAsync(code, {
    filename: file,
    presets: [
      ["@babel/preset-typescript", { isTSX: isTsx, allExtensions: true }],
      ["@babel/preset-react", { runtime: "automatic" }]
    ],
    babelrc: false,
    configFile: false,
    sourceMaps: false,
  });

  if (!result || !result.code) {
    console.error(`Failed to transform ${file}`);
    return;
  }

  let newCode = result.code;

  // Replace explicit .ts/.tsx import extensions inside the transformed file
  newCode = newCode.replace(/(from\s+['"][^'"]+)(\.tsx|\.ts)(['"])/g, (m, p1, p2, p3) => {
    const newExt = p2 === ".tsx" ? ".jsx" : ".js";
    return p1 + newExt + p3;
  });

  const newExt = isTsx ? ".jsx" : ".js";
  const newFile = file.slice(0, -ext.length) + newExt;

  await fs.outputFile(newFile, newCode, "utf8");
  await fs.remove(file);
  console.log(`Converted: ${file} -> ${newFile}`);
}

async function run() {
  const files = globSync("src/**/*.{ts,tsx}", { nodir: true });
  if (files.length === 0) {
    console.log("No .ts/.tsx files found in src/");
    return;
  }

  for (const f of files) {
    try {
      await convertFile(f);
    } catch (err) {
      console.error(`Error converting ${f}:`, err);
    }
  }

  console.log("Conversion completed. Please run `npm install` and then `npm run dev` after verifying files.");
}

run();
