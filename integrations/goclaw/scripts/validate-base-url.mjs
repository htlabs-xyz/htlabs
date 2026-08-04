#!/usr/bin/env node

const [raw, allowRemoteRaw = "false"] = process.argv.slice(2);
if (!raw) {
  console.error("GoClaw base URL is required");
  process.exit(1);
}

let url;
try {
  url = new URL(raw);
} catch {
  console.error("GoClaw base URL is invalid");
  process.exit(1);
}

if (url.username || url.password || url.search || url.hash) {
  console.error("GoClaw base URL must not contain userinfo, query or fragment");
  process.exit(1);
}
if (url.pathname !== "/") {
  console.error("GoClaw base URL must be an origin without a path");
  process.exit(1);
}

const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
if (loopback) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    console.error("loopback GoClaw URL must use HTTP or HTTPS");
    process.exit(1);
  }
} else {
  if (allowRemoteRaw !== "true") {
    console.error("remote GoClaw URL is disabled");
    process.exit(1);
  }
  if (url.protocol !== "https:") {
    console.error("remote GoClaw URL must use HTTPS");
    process.exit(1);
  }
}

process.stdout.write(url.origin);
