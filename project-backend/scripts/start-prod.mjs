import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import dotenv from "dotenv";

const projectRoot = process.cwd();
const mainFile = path.join(projectRoot, "dist", "main.js");
const startupTimeoutMs = 30000;
const recentOutput = [];

dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

const port = Number.parseInt(process.env.PORT ?? "4000", 10);

if (!existsSync(mainFile)) {
  console.error("No production build was found.");
  console.error("Run `npm run build` successfully before `npm run start:prod`.");
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
        const chunks = [];
        res.setEncoding("utf8");
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            ok: true,
            statusCode: res.statusCode ?? 500,
            body: chunks.join(""),
          });
        });
      },
    );

    req.on("error", () => resolve({ ok: false, statusCode: 0, body: "" }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, statusCode: 0, body: "" });
    });
    req.end();
  });
}

const existingServer = await requestRoot();
if (existingServer.ok) {
  if (existingServer.body.includes("Hello World!")) {
    console.log(`Backend is already available at http://localhost:${port}`);
    process.exit(0);
  }

  console.error(
    `Port ${port} is already in use by another service. Stop it first, then run \`npm run start:prod\` again.`,
  );
  process.exit(1);
}

const child = spawn(process.execPath, [mainFile], {
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
    console.error("\nBackend failed to start cleanly.");
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

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    const response = await requestRoot();
    if (
      response.ok &&
      response.statusCode < 500 &&
      response.body.includes("Hello World!")
    ) {
      isReady = true;
      console.log(`\nBackend ready at http://localhost:${port}`);
      return;
    }

    await delay(500);
  }

  console.error(
    `\nBackend did not respond on http://localhost:${port} within ${startupTimeoutMs / 1000} seconds.`,
  );
  stopChild();
  process.exitCode = 1;
}

void waitForServer();
