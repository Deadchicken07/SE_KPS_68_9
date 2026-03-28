import { readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const nextDevDir = path.join(projectRoot, ".next", "dev");
const lockPath = path.join(projectRoot, ".dev-server.lock");
const port = Number(process.env.PORT ?? 3000);
const nextBin = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

function isPortBusy(targetPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "EADDRINUSE") {
          resolve(true);
          return;
        }
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve(false));
    });

    server.listen(targetPort);
  });
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function releaseLock() {
  try {
    unlinkSync(lockPath);
  } catch {
    // ignore stale cleanup failures
  }
}

function acquireLock() {
  while (true) {
    try {
      writeFileSync(lockPath, String(process.pid), { flag: "wx" });
      return;
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error)) {
        throw error;
      }

      if (error.code !== "EEXIST") {
        throw error;
      }

      const existingPid = Number(readFileSync(lockPath, "utf8").trim());

      if (Number.isInteger(existingPid) && existingPid > 0 && isProcessRunning(existingPid)) {
        console.error(
          "Another frontend dev startup is already running for this project. Stop it before running npm run dev again.",
        );
        process.exit(1);
      }

      releaseLock();
    }
  }
}

async function main() {
  acquireLock();

  if (await isPortBusy(port)) {
    releaseLock();
    console.error(
      `Port ${port} is already in use. Stop the existing dev server before running npm run dev again.`,
    );
    process.exit(1);
  }

  try {
    rmSync(nextDevDir, { recursive: true, force: true });
  } catch (error) {
    releaseLock();
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

  const handleSignal = (signal) => {
    releaseLock();

    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", () => handleSignal("SIGINT"));
  process.on("SIGTERM", () => handleSignal("SIGTERM"));

  child.on("exit", (code, signal) => {
    releaseLock();

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

void main();
