#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

const PKG_ROOT = path.resolve(__dirname, "..");
const SKILLS_SRC_DIR = path.join(PKG_ROOT, "skills");
const VERSION = require(path.join(PKG_ROOT, "package.json")).version;

const CWD = process.cwd();
const HOME = os.homedir();

// ---------------------------------------------------------------------------
// Leitura das skills
// ---------------------------------------------------------------------------

function listAvailableSkills() {
  if (!fs.existsSync(SKILLS_SRC_DIR)) return [];
  return fs
    .readdirSync(SKILLS_SRC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(SKILLS_SRC_DIR, name, "SKILL.md")))
    .sort();
}

/**
 * Lê uma skill e separa frontmatter do corpo.
 * Retorna { name, description, body, raw, dir, extraFiles }.
 */
function readSkill(skillName) {
  const dir = path.join(SKILLS_SRC_DIR, skillName);
  const file = path.join(dir, "SKILL.md");
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  let front = "";
  let body = raw;
  if (match) {
    front = match[1];
    body = match[2];
  }

  const nameMatch = front.match(/^name:\s*(.+)$/m);
  const descMatch = front.match(/^description:\s*(.+)$/m);

  const extraFiles = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !(e.isFile() && e.name === "SKILL.md"))
    .map((e) => e.name);

  return {
    name: nameMatch ? nameMatch[1].trim() : skillName,
    dirName: skillName,
    description: descMatch ? descMatch[1].trim() : "",
    body: body.trim(),
    raw,
    dir,
    extraFiles,
  };
}

// ---------------------------------------------------------------------------
// Utilitários de escrita
// ---------------------------------------------------------------------------

function writeFile(destPath, content) {
  const existed = fs.existsSync(destPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content, "utf8");
  return existed ? "atualizada" : "instalada";
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Insere ou substitui um bloco delimitado por marcadores em um arquivo
 * compartilhado (AGENTS.md, GEMINI.md). Idempotente: reinstalar substitui
 * o bloco anterior em vez de duplicar.
 */
function upsertBlock(filePath, skillName, content) {
  const start = `<!-- nalberth-skills:${skillName} -->`;
  const end = `<!-- /nalberth-skills:${skillName} -->`;
  const block = `${start}\n${content}\n${end}`;

  const existed = fs.existsSync(filePath);
  let current = existed ? fs.readFileSync(filePath, "utf8") : "";

  const blockRe = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  let action;

  if (blockRe.test(current)) {
    current = current.replace(blockRe, block);
    action = "atualizada";
  } else {
    current = current.trim() ? `${current.trimEnd()}\n\n${block}\n` : `${block}\n`;
    action = "instalada";
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, current, "utf8");
  return action;
}

function removeBlock(filePath, skillName) {
  if (!fs.existsSync(filePath)) return false;
  const start = `<!-- nalberth-skills:${skillName} -->`;
  const end = `<!-- /nalberth-skills:${skillName} -->`;
  const blockRe = new RegExp(`\\n*${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\\n*`);
  const current = fs.readFileSync(filePath, "utf8");
  if (!blockRe.test(current)) return false;
  const next = current.replace(blockRe, "\n\n").trim();
  if (next) fs.writeFileSync(filePath, next + "\n", "utf8");
  else fs.unlinkSync(filePath);
  return true;
}

/**
 * Rebaixa os titulos markdown em um nivel, para embutir o corpo da skill
 * sob um "## nome" em arquivos compartilhados sem quebrar a hierarquia.
 * Ignora linhas dentro de blocos de codigo cercados.
 */
function demoteHeadings(body) {
  let inFence = false;
  return body
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(/^(#{1,5})\s/, "#$1 ");
    })
    .join("\n");
}

function frontmatter(fields) {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${value}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

// ---------------------------------------------------------------------------
// Alvos de instalação (um por ferramenta de IA)
// ---------------------------------------------------------------------------

/**
 * Monta o trecho de uma skill para arquivos compartilhados (AGENTS.md, GEMINI.md).
 * Usa o proprio titulo da skill como ancora e insere a descricao logo abaixo dele.
 */
function buildSharedBlock(skill) {
  const demoted = demoteHeadings(skill.body);
  const lines = demoted.split("\n");
  const headingIndex = lines.findIndex((line) => /^#{1,6}\s/.test(line));

  if (headingIndex === -1) {
    return `## ${skill.name}\n\n_${skill.description}_\n\n${demoted}`;
  }

  lines.splice(headingIndex + 1, 0, "", `_${skill.description}_`);
  return lines.join("\n");
}

const TARGETS = {
  claude: {
    label: "Claude Code / Claude Desktop",
    scopes: ["global", "local"],
    pathFor: (skill, isLocal) =>
      path.join(isLocal ? CWD : HOME, ".claude", "skills", skill.dirName),
    install(skill, isLocal) {
      const dest = this.pathFor(skill, isLocal);
      const existed = fs.existsSync(dest);
      copyDir(skill.dir, dest);
      return { action: existed ? "atualizada" : "instalada", dest };
    },
    remove(skill, isLocal) {
      const dest = this.pathFor(skill, isLocal);
      if (!fs.existsSync(dest)) return null;
      fs.rmSync(dest, { recursive: true, force: true });
      return dest;
    },
  },

  cursor: {
    label: "Cursor",
    scopes: ["local"],
    pathFor: (skill) => path.join(CWD, ".cursor", "rules", `${skill.dirName}.mdc`),
    install(skill) {
      const dest = this.pathFor(skill);
      const content =
        frontmatter({ description: skill.description, alwaysApply: "false" }) +
        "\n" +
        skill.body +
        "\n";
      return { action: writeFile(dest, content), dest };
    },
    remove(skill) {
      const dest = this.pathFor(skill);
      if (!fs.existsSync(dest)) return null;
      fs.unlinkSync(dest);
      return dest;
    },
  },

  windsurf: {
    label: "Windsurf",
    scopes: ["local"],
    pathFor: (skill) => path.join(CWD, ".windsurf", "rules", `${skill.dirName}.md`),
    install(skill) {
      const dest = this.pathFor(skill);
      const content =
        frontmatter({ trigger: "model_decision", description: skill.description }) +
        "\n" +
        skill.body +
        "\n";
      return { action: writeFile(dest, content), dest };
    },
    remove(skill) {
      const dest = this.pathFor(skill);
      if (!fs.existsSync(dest)) return null;
      fs.unlinkSync(dest);
      return dest;
    },
  },

  copilot: {
    label: "GitHub Copilot (VS Code)",
    scopes: ["local"],
    pathFor: (skill) =>
      path.join(CWD, ".github", "instructions", `${skill.dirName}.instructions.md`),
    install(skill) {
      const dest = this.pathFor(skill);
      const content =
        frontmatter({ applyTo: '"**"', description: skill.description }) +
        "\n" +
        skill.body +
        "\n";
      return { action: writeFile(dest, content), dest };
    },
    remove(skill) {
      const dest = this.pathFor(skill);
      if (!fs.existsSync(dest)) return null;
      fs.unlinkSync(dest);
      return dest;
    },
  },

  agents: {
    label: "AGENTS.md (Codex, Zed, Aider, Jules e afins)",
    scopes: ["local"],
    pathFor: () => path.join(CWD, "AGENTS.md"),
    install(skill) {
      const dest = this.pathFor(skill);
      const content = buildSharedBlock(skill);
      return { action: upsertBlock(dest, skill.dirName, content), dest };
    },
    remove(skill) {
      const dest = this.pathFor(skill);
      return removeBlock(dest, skill.dirName) ? dest : null;
    },
  },

  gemini: {
    label: "Gemini CLI",
    scopes: ["global", "local"],
    pathFor: (skill, isLocal) =>
      isLocal ? path.join(CWD, "GEMINI.md") : path.join(HOME, ".gemini", "GEMINI.md"),
    install(skill, isLocal) {
      const dest = this.pathFor(skill, isLocal);
      const content = buildSharedBlock(skill);
      return { action: upsertBlock(dest, skill.dirName, content), dest };
    },
    remove(skill, isLocal) {
      const dest = this.pathFor(skill, isLocal);
      return removeBlock(dest, skill.dirName) ? dest : null;
    },
  },

  print: {
    label: "Qualquer chat (ChatGPT, Gemini, Claude.ai) — imprime pra copiar e colar",
    scopes: ["global", "local"],
    install(skill) {
      process.stdout.write(`\n${skill.body}\n\n`);
      return { action: "impressa", dest: "(stdout)" };
    },
    remove() {
      return null;
    },
  },
};

const DEFAULT_TARGET = "claude";

// ---------------------------------------------------------------------------
// Parsing de argumentos
// ---------------------------------------------------------------------------

function parseArgs(args) {
  const flags = { local: false, all: false, target: DEFAULT_TARGET };
  const names = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--local") flags.local = true;
    else if (arg === "--global") {
      flags.local = false;
      flags.explicitGlobal = true;
    }
    else if (arg === "--all") flags.all = true;
    else if (arg.startsWith("--target=")) flags.target = arg.slice("--target=".length);
    else if (arg === "--target" || arg === "-t") flags.target = args[++i];
    else if (arg.startsWith("-")) flags.unknown = arg;
    else names.push(arg);
  }

  return { flags, names };
}

function resolveTarget(name) {
  if (!name) return { error: "A flag --target precisa de um valor." };
  const target = TARGETS[name.toLowerCase()];
  if (!target) {
    return {
      error: `Alvo "${name}" nao existe. Opcoes: ${Object.keys(TARGETS).join(", ")}.`,
    };
  }
  return { key: name.toLowerCase(), target };
}

// ---------------------------------------------------------------------------
// Comandos
// ---------------------------------------------------------------------------

function cmdList() {
  const skills = listAvailableSkills();
  if (skills.length === 0) {
    console.log("Nenhuma skill disponivel neste pacote ainda.");
    return;
  }
  console.log("Skills disponiveis:\n");
  for (const name of skills) {
    const skill = readSkill(name);
    console.log(`  ${name}`);
    if (skill.description) console.log(`    ${skill.description}\n`);
  }
}

function cmdTargets() {
  console.log("Alvos de instalacao (--target):\n");
  for (const [key, target] of Object.entries(TARGETS)) {
    const scopes = target.scopes.includes("global") ? "global e --local" : "somente --local";
    console.log(`  ${key.padEnd(9)} ${target.label}`);
    console.log(`  ${" ".repeat(9)} escopo: ${scopes}\n`);
  }
  console.log(`Padrao: --target ${DEFAULT_TARGET}`);
}

function cmdValidate() {
  const skills = listAvailableSkills();
  const problems = [];

  if (skills.length === 0) problems.push("Nenhuma skill encontrada em skills/.");

  for (const dirName of skills) {
    const skill = readSkill(dirName);
    if (!skill.description) problems.push(`${dirName}: falta "description" no frontmatter.`);
    if (!skill.body) problems.push(`${dirName}: SKILL.md nao tem corpo depois do frontmatter.`);
    if (skill.name !== dirName) {
      problems.push(`${dirName}: frontmatter "name: ${skill.name}" difere do nome da pasta.`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(dirName)) {
      problems.push(`${dirName}: nome deve ser kebab-case minusculo.`);
    }
  }

  if (problems.length > 0) {
    console.error("Problemas encontrados:\n");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }

  console.log(`OK: ${skills.length} skill(s) validada(s).`);
}

function resolveSkillNames(flags, names) {
  const available = listAvailableSkills();
  const selected = flags.all ? available : names;

  if (selected.length === 0) {
    console.error("Informe o nome de ao menos uma skill, ou use --all.");
    console.error("Use `nalberth-skills list` para ver as opcoes.");
    process.exitCode = 1;
    return null;
  }
  return selected;
}

function cmdAdd(args) {
  const { flags, names } = parseArgs(args);

  const resolved = resolveTarget(flags.target);
  if (resolved.error) {
    console.error(resolved.error);
    process.exitCode = 1;
    return;
  }
  const { key, target } = resolved;

  let isLocal = flags.local;
  if (isLocal && !target.scopes.includes("local")) {
    console.error(`O alvo "${key}" nao aceita --local.`);
    process.exitCode = 1;
    return;
  }
  if (!isLocal && !target.scopes.includes("global")) {
    if (flags.explicitGlobal) {
      console.log(`Aviso: "${key}" nao tem instalacao global — usando o projeto atual.`);
    }
    isLocal = true;
  }

  const selected = resolveSkillNames(flags, names);
  if (!selected) return;

  for (const dirName of selected) {
    const skill = readSkill(dirName);
    if (!skill) {
      console.error(`Skill "${dirName}" nao encontrada. Rode \`nalberth-skills list\`.`);
      process.exitCode = 1;
      continue;
    }

    const { action, dest } = target.install(skill, isLocal);
    console.log(`${action}: ${dirName} [${key}] -> ${dest}`);

    if (key !== "claude" && skill.extraFiles.length > 0) {
      console.log(
        `  aviso: ${skill.extraFiles.join(", ")} nao foi copiado — ` +
          `${key} le apenas o conteudo de SKILL.md.`
      );
    }
  }
}

function cmdRemove(args) {
  const { flags, names } = parseArgs(args);

  const resolved = resolveTarget(flags.target);
  if (resolved.error) {
    console.error(resolved.error);
    process.exitCode = 1;
    return;
  }
  const { key, target } = resolved;

  const isLocal = flags.local || !target.scopes.includes("global");
  const selected = resolveSkillNames(flags, names);
  if (!selected) return;

  for (const dirName of selected) {
    const skill = readSkill(dirName);
    if (!skill) {
      console.error(`Skill "${dirName}" nao existe neste pacote.`);
      process.exitCode = 1;
      continue;
    }
    const removed = target.remove(skill, isLocal);
    if (removed) console.log(`removida: ${dirName} [${key}] -> ${removed}`);
    else console.log(`nada a remover: ${dirName} [${key}]`);
  }
}

function printHelp() {
  console.log(`nalberth-skills v${VERSION} - instala skills de IA em qualquer maquina

Uso:
  nalberth-skills list                      Lista as skills disponiveis
  nalberth-skills targets                   Lista os alvos de IA suportados
  nalberth-skills add <skill...>            Instala skill(s)
  nalberth-skills remove <skill...>         Remove skill(s) instalada(s)
  nalberth-skills validate                  Checa o formato das skills do repo

Flags:
  -t, --target <alvo>   Ferramenta de destino (padrao: ${DEFAULT_TARGET})
      --local           Instala no projeto atual em vez de na maquina
      --all             Aplica a todas as skills disponiveis

Exemplos:
  npx nalberth-skills add mentor-dev                      # Claude Code, global
  npx nalberth-skills add mentor-dev --target cursor      # Cursor, neste projeto
  npx nalberth-skills add mentor-dev -t agents            # AGENTS.md (qualquer IA)
  npx nalberth-skills add --all --target copilot          # todas, para o Copilot
  npx nalberth-skills add mentor-dev -t print | pbcopy    # copia pra colar num chat
  npx nalberth-skills remove mentor-dev                   # desinstala
`);
}

function main() {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "list":
      cmdList();
      break;
    case "targets":
      cmdTargets();
      break;
    case "add":
      cmdAdd(rest);
      break;
    case "remove":
    case "rm":
      cmdRemove(rest);
      break;
    case "validate":
      cmdValidate();
      break;
    case "--version":
    case "-v":
      console.log(VERSION);
      break;
    case "help":
    case undefined:
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      console.error(`Comando desconhecido: ${command}\n`);
      printHelp();
      process.exitCode = 1;
  }
}

main();
