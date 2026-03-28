import { rmSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");
const nextBin = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

try {
  rmSync(nextDir, { recursive: true, force: true });
} catch (error) {
  console.error("Failed to clear the old .next build directory.");
  console.error(error);
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "build"], {
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

