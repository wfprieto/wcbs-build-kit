/**
 * WCBS OpenCode plugin.
 *
 * The plugin exposes the WCBS skills directory and injects the generated,
 * compact `using-wcbs` bootstrap once per conversation. It intentionally does
 * not claim a runtime support level: that requires a clean-session record.
 *
 * Adapter structure informed by obra/Superpowers (MIT); WCBS implementation
 * and payload are repository-specific. See 90_archive/provenance/PROVENANCE_MAP.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(pluginDirectory, "..", "..");
const skillsDirectory = path.join(packageRoot, "skills");
const bootstrapPath = path.join(packageRoot, "runtime_adapters", "generated", "using-wcbs-bootstrap.md");
const marker = "WCBS_KIT_ACTIVE:opencode";
let cachedBootstrap;

function loadBootstrap() {
  if (cachedBootstrap !== undefined) return cachedBootstrap;
  try {
    const template = fs.readFileSync(bootstrapPath, "utf8");
    cachedBootstrap = template.replace("{{activation_marker}}", marker).trim();
  } catch {
    cachedBootstrap = null;
  }
  return cachedBootstrap;
}

function alreadyInjected(message) {
  return Array.isArray(message?.parts) && message.parts.some((part) => part?.type === "text" && typeof part.text === "string" && part.text.includes(marker));
}

export const WCBSPlugin = async () => ({
  config: async (config) => {
    config.skills ??= {};
    config.skills.paths ??= [];
    if (!config.skills.paths.includes(skillsDirectory)) config.skills.paths.push(skillsDirectory);
  },
  "experimental.chat.messages.transform": async (_input, output) => {
    const bootstrap = loadBootstrap();
    if (!bootstrap || !Array.isArray(output?.messages)) return;
    const firstUser = output.messages.find((message) => message?.info?.role === "user");
    if (!firstUser || alreadyInjected(firstUser) || !Array.isArray(firstUser.parts) || !firstUser.parts.length) return;
    const referencePart = firstUser.parts[0];
    firstUser.parts.unshift({ ...referencePart, type: "text", text: bootstrap });
  }
});
