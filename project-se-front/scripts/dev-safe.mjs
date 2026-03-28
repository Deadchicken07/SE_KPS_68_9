import { rmSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const nextDevDir = path.join(projectRoot, ".next", "dev");
const nextBin = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

try {
  rmSync(nextDevDir, { recursive: true, force: true });
} catch (error) {
  console.error("Failed to clear the old .next/dev directory.");
  console.error(error);
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev", "--webpack"], {
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
