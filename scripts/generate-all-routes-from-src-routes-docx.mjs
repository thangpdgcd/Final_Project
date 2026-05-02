import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  HeadingLevel,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_DIR = path.resolve(__dirname, "..", "src", "routes");

const listJsFiles = (dir) => {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listJsFiles(full));
    else if (ent.isFile() && ent.name.endsWith(".js")) out.push(full);
  }
  return out;
};

const normalizeSlashes = (p) => p.replace(/\\/g, "/");

const joinUrl = (prefix, routePath) => {
  const a = String(prefix ?? "").trim();
  const b = String(routePath ?? "").trim();
  if (!a) return b || "/";
  if (!b) return a || "/";
  const left = a.endsWith("/") ? a.slice(0, -1) : a;
  const right = b.startsWith("/") ? b : `/${b}`;
  return `${left}${right}`;
};

const METHOD_RE = /\brouter\.(get|post|put|delete|patch)\s*\(\s*(['"`])([^'"`]+)\2/gi;
const USE_RE = /\bapp\.use\s*\(\s*(['"`])([^'"`]+)\1\s*,/gi;

const guessMountPrefixesFromInit = (content) => {
  const prefixes = new Set();
  let m;
  while ((m = USE_RE.exec(content))) {
    prefixes.add(m[2]);
  }
  // Most route init files in this repo mount under /api
  if (prefixes.size === 0 && content.includes("init") && content.includes("app.use(")) {
    // leave empty
  }
  return prefixes.size ? [...prefixes] : [""];
};

const extractRouterRoutes = (content) => {
  const routes = [];
  let m;
  while ((m = METHOD_RE.exec(content))) {
    routes.push({
      method: m[1].toUpperCase(),
      path: m[3],
    });
  }
  return routes;
};

const files = listJsFiles(ROUTES_DIR);

const collected = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const localRoutes = extractRouterRoutes(content);
  if (localRoutes.length === 0) continue;

  const isInit = /\bconst\s+init\w*Routes\b/.test(content) || /\bexport\s+default\s+init\w*Routes\b/.test(content);
  const prefixes = isInit ? guessMountPrefixesFromInit(content) : ["/api"]; // build routers are mounted at /api by index.js

  for (const prefix of prefixes) {
    for (const r of localRoutes) {
      const fullPath = joinUrl(prefix, r.path);
      collected.push({
        method: r.method,
        path: fullPath,
        source: normalizeSlashes(path.relative(path.resolve(__dirname, ".."), file)),
      });
    }
  }
}

// Dedupe + sort
const key = (r) => `${r.method} ${r.path} ${r.source}`;
const deduped = Array.from(new Map(collected.map((r) => [key(r), r])).values());
deduped.sort((a, b) => {
  const p = a.path.localeCompare(b.path);
  if (p !== 0) return p;
  const m = a.method.localeCompare(b.method);
  if (m !== 0) return m;
  return a.source.localeCompare(b.source);
});

const header = ["#", "Method", "URL", "Source file"];

const cell = (text, { bold = false, code = false } = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text ?? ""),
            bold,
            font: code ? "Consolas" : "Calibri",
          }),
        ],
      }),
    ],
  });

const table = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: header.map((h) => cell(h, { bold: true })),
    }),
    ...deduped.map((r, idx) =>
      new TableRow({
        children: [
          cell(String(idx + 1)),
          cell(r.method),
          cell(r.path, { code: true }),
          cell(r.source, { code: true }),
        ],
      }),
    ),
  ],
});

const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          text: "Tổng hợp routes từ src/routes",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Nguồn: ${normalizeSlashes(path.relative(path.resolve(__dirname, ".."), ROUTES_DIR))}`,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        table,
      ],
    },
  ],
});

const outPath = path.resolve(__dirname, "..", "docs", "all-routes-from-src-routes.docx");
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buf);
console.log(`Wrote ${outPath} (${deduped.length} routes)`);

