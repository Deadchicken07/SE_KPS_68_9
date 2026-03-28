import { rmSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const nestBin = path.join(
  projectRoot,
  "node_modules",
  "@nestjs",
  "cli",
  "bin",
  "nest.js",
);

try {
  rmSync(distDir, { recursive: true, force: true });
} catch (error) {
  console.error("Failed to clear the old dist directory.");
  console.error(error);
  process.exit(1);
}

const child = spawn(process.execPath, [nestBin, "build"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

