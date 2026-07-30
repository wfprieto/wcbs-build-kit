/**
 * WCBS Pi extension.
 *
 * Adapter structure informed by obra/Superpowers (MIT); WCBS implementation
 * and payload are repository-specific. See 90_archive/provenance/PROVENANCE_MAP.md.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const extensionDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(extensionDirectory, "..", "..");
const skillsDirectory = resolve(packageRoot, "skills");
const bootstrapPath = resolve(packageRoot, "runtime_adapters", "generated", "using-wcbs-bootstrap.md");
const marker = "WCBS_KIT_ACTIVE:pi";
let cachedBootstrap: string | null | undefined;

function bootstrap(): string | null {
  if (cachedBootstrap !== undefined) return cachedBootstrap;
  try {
    cachedBootstrap = readFileSync(bootstrapPath, "utf8").replace("{{activation_marker}}", marker).trim();
  } catch {
    cachedBootstrap = null;
  }
  return cachedBootstrap;
}

function hasBootstrap(messages: unknown[]): boolean {
  return messages.some((message) => JSON.stringify(message).includes(marker));
}

export default function wcbsPiExtension(pi: ExtensionAPI) {
  let inject = true;
  pi.on("resources_discover", async () => ({ skillPaths: [skillsDirectory] }));
  pi.on("session_start", async () => { inject = true; });
  pi.on("session_compact", async () => { inject = true; });
  pi.on("agent_end", async () => { inject = false; });
  pi.on("context", async (event) => {
    if (!inject || hasBootstrap(event.messages)) return;
    const text = bootstrap();
    if (!text) return;
    return { messages: [{ role: "user" as const, content: [{ type: "text", text }], timestamp: Date.now() }, ...event.messages] };
  });
}
