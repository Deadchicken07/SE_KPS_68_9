import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const projectRoot = process.cwd();
const nextBin = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const buildIdPath = path.join(projectRoot, ".next", "BUILD_ID");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const startupTimeoutMs = 30000;
const recentOutput = [];

if (!existsSync(nextBin)) {
  console.error("Next.js is not installed. Run `npm install` first.");
  process.exit(1);
}

if (!existsSync(buildIdPath)) {
  console.error("No production build was found.");
  console.error("Run `npm run build` successfully before `npm run start`.");
  process.exit(1);
}

if (!Number.isInteger(port) || port <= 0) {
  console.error(`Invalid PORT value: ${process.env.PORT}`);
  process.exit(1);
}

async function requestRoot() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: "/",
        method: "GET",
        timeout: 1000,
      },
      (res) => {
        res.resume();
        resolve({
          ok: true,
          statusCode: res.statusCode ?? 500,
        });
      },
    );

    req.on("error", () => resolve({ ok: false, statusCode: 0 }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, statusCode: 0 });
    });
    req.end();
  });
}

const existingServer = await requestRoot();
if (existingServer.ok) {
  console.error(
    `Port ${port} is already serving a frontend or another service. Stop the old process first, then run \`npm run start\` again to load the latest build.`,
  );
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
  cwd: projectRoot,
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
  windowsHide: false,
});

let isReady = false;

function pushRecentOutput(chunk) {
  recentOutput.push(chunk);
  if (recentOutput.length > 25) {
    recentOutput.shift();
  }
}

function forward(stream, target) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    pushRecentOutput(chunk);
    target.write(chunk);
  });
}

forward(child.stdout, process.stdout);
forward(child.stderr, process.stderr);

function stopChild() {
  if (!child.killed) {
    child.kill("SIGTERM");
  }
}

for (const signal of ["SIGINT", "SIGTERM", "SIGBREAK"]) {
  process.on(signal, () => {
    stopChild();
  });
}

child.on("exit", (code, signal) => {
  if (!isReady) {
    console.error("\nFrontend failed to start cleanly.");
    if (recentOutput.length) {
      console.error("Recent output:");
      process.stderr.write(recentOutput.join(""));
    }
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? (isReady ? 0 : 1));
});

async function isHealthy() {
  const response = await requestRoot();
  return response.ok && response.statusCode < 500;
}

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (await isHealthy()) {
      isReady = true;
      console.log(`\nFrontend ready at http://localhost:${port}`);
      return;
    }

    await delay(500);
  }

  console.error(
    `\nFrontend did not respond on http://localhost:${port} within ${startupTimeoutMs / 1000} seconds.`,
  );
  stopChild();
  process.exitCode = 1;
}

void waitForServer();
