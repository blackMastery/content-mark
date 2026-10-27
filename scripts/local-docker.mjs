import http from "node:http";
import { execFileSync } from "node:child_process";

// Explicit HostIp bindings also work on Docker Desktop installations that
// ignore a bridge network's default host_binding_ipv4 option.
export async function restrictLocalPorts(project) {
  const endpoint = JSON.parse(
    execFileSync(
      "docker",
      ["context", "inspect", "--format", "{{json .Endpoints.docker.Host}}"],
      { encoding: "utf8" },
    ),
  );
  if (!endpoint.startsWith("unix://"))
    throw new Error(
      "The local development helper requires a local Unix Docker socket.",
    );
  const socketPath = endpoint.slice("unix://".length);
  let apiPrefix = "";
  const call = (method, path, body) =>
    new Promise((resolve, reject) => {
      const request = http.request(
        {
          socketPath,
          path: apiPrefix + path,
          method,
          headers: body ? { "Content-Type": "application/json" } : {},
        },
        (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf8");
            let result;
            try {
              result = text ? JSON.parse(text) : null;
            } catch {
              result = text;
            }
            if (response.statusCode >= 400) {
              reject(
                new Error(
                  `Docker ${method} ${path}: ${result?.message || response.statusCode}`,
                ),
              );
              return;
            }
            resolve(result);
          });
        },
      );
      request.on("error", reject);
      request.setTimeout(90000, () =>
        request.destroy(new Error("Docker operation timed out.")),
      );
      if (body) request.write(JSON.stringify(body));
      request.end();
    });
  const version = await call("GET", "/version");
  apiPrefix = `/v${version.ApiVersion}`;
  const filters = encodeURIComponent(
    JSON.stringify({ label: [`com.supabase.cli.project=${project}`] }),
  );
  const containers = await call("GET", `/containers/json?filters=${filters}`);
  let changed = false;
  for (const row of containers) {
    const original = await call("GET", `/containers/${row.Id}/json`);
    const ports = original.HostConfig.PortBindings || {};
    if (
      !Object.values(ports).some((bindings) =>
        bindings?.some((binding) => binding.HostIp !== "127.0.0.1"),
      )
    )
      continue;
    const name = original.Name.slice(1);
    if (!name.endsWith(`_${project}`))
      throw new Error("Refusing to modify an unrelated container.");
    if (
      name.includes("_db_") &&
      !original.Mounts.some(
        (mount) =>
          mount.Type === "volume" &&
          mount.Destination === "/var/lib/postgresql/data",
      )
    )
      throw new Error(
        "Database persistence must be verified before rebinding ports.",
      );
    const bindings = Object.fromEntries(
      Object.entries(ports).map(([port, items]) => [
        port,
        items?.map((item) => ({ ...item, HostIp: "127.0.0.1" })),
      ]),
    );
    const endpoints = Object.fromEntries(
      Object.entries(original.NetworkSettings.Networks).map(
        ([network, settings]) => [
          network,
          {
            Aliases: [
              ...(settings.Aliases || []).filter(
                (alias) =>
                  alias !== original.Id && alias !== original.Id.slice(0, 12),
              ),
              name,
            ],
            NetworkID: settings.NetworkID,
          },
        ],
      ),
    );
    let replacement;
    try {
      await call("POST", `/containers/${row.Id}/stop?t=20`);
      // Supabase copies gateway configuration into the container's writable
      // layer. Preserve it as well as mounted volumes when changing bindings.
      const snapshot = await call("POST", `/commit?container=${row.Id}`);
      await call(
        "POST",
        `/containers/${row.Id}/rename?name=${encodeURIComponent(name + "-loopback-backup")}`,
      );
      for (const network of Object.keys(endpoints))
        await call(
          "POST",
          `/networks/${encodeURIComponent(network)}/disconnect`,
          { Container: row.Id },
        );
      replacement = await call(
        "POST",
        `/containers/create?name=${encodeURIComponent(name)}`,
        {
          ...original.Config,
          Image: snapshot.Id,
          HostConfig: { ...original.HostConfig, PortBindings: bindings },
          NetworkingConfig: { EndpointsConfig: endpoints },
        },
      );
      await call("POST", `/containers/${replacement.Id}/start`);
      let healthy = false;
      for (let attempt = 0; attempt < 60; attempt++) {
        const inspect = await call("GET", `/containers/${replacement.Id}/json`);
        if (
          inspect.State.Running &&
          (!inspect.State.Health || inspect.State.Health.Status === "healthy")
        ) {
          healthy = true;
          break;
        }
        if (!inspect.State.Running) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (!healthy)
        throw new Error(`${name} did not become healthy after rebinding.`);
      await call("DELETE", `/containers/${row.Id}`); // No volume deletion.
      changed = true;
      console.log(`Local-only port binding verified: ${name}`);
    } catch (error) {
      if (replacement)
        await call("DELETE", `/containers/${replacement.Id}?force=true`).catch(
          () => {},
        );
      for (const [network, EndpointConfig] of Object.entries(endpoints))
        await call("POST", `/networks/${encodeURIComponent(network)}/connect`, {
          Container: row.Id,
          EndpointConfig,
        }).catch(() => {});
      await call(
        "POST",
        `/containers/${row.Id}/rename?name=${encodeURIComponent(name)}`,
      ).catch(() => {});
      await call("POST", `/containers/${row.Id}/start`).catch(() => {});
      throw error;
    }
  }
  if (changed) {
    const current = await call("GET", `/containers/json?filters=${filters}`);
    for (const row of current) {
      if (
        row.Names.some((name) =>
          /supabase_(auth|rest|storage|pg_meta)_/.test(name),
        )
      )
        await call("POST", `/containers/${row.Id}/restart?t=10`);
    }
  }
  const current = await call("GET", `/containers/json?filters=${filters}`);
  for (const row of current)
    for (const port of row.Ports || [])
      if (port.PublicPort && port.IP !== "127.0.0.1")
        throw new Error(
          "A published development port is still network-accessible.",
        );
  console.log(
    "Supabase development ports are bound to 127.0.0.1. Database volumes are preserved.",
  );
}

if (process.argv.includes("--bind-only"))
  await restrictLocalPorts("conten-mark-landingpage");
