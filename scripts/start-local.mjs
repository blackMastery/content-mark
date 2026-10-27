import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { restrictLocalPorts } from "./local-docker.mjs";
try {
  execFileSync("docker", ["network", "inspect", "content-mark-local"], {
    stdio: "ignore",
  });
} catch {
  execFileSync(
    "docker",
    [
      "network",
      "create",
      "--driver",
      "bridge",
      "--opt",
      "com.docker.network.bridge.host_binding_ipv4=127.0.0.1",
      "content-mark-local",
    ],
    { stdio: "ignore" },
  );
}
console.log("Starting the Content Mark local Supabase stack…");
execFileSync(
  resolve("node_modules/.bin/supabase"),
  [
    "start",
    "--network-id",
    "content-mark-local",
    "--exclude",
    "logflare,vector,edge-runtime,realtime",
  ],
  { stdio: ["ignore", "pipe", "inherit"], maxBuffer: 10_000_000 },
);
await restrictLocalPorts("conten-mark-landingpage");
console.log("API: http://127.0.0.1:54321 · Studio: http://127.0.0.1:54323");
