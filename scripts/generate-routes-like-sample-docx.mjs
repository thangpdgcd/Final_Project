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
  PageOrientation,
  WidthType,
  HeadingLevel,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_DIR = path.resolve(__dirname, "..", "src", "routes");
const MODELS_DIR = path.resolve(__dirname, "..", "src", "models");

const listJsFiles = (dir) => {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listJsFiles(full));
    else if (ent.isFile() && ent.name.endsWith(".js")) out.push(full);
  }
  return out;
};

const listModelFiles = () =>
  fs
    .readdirSync(MODELS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".js") && e.name !== "index.js")
    .map((e) => path.join(MODELS_DIR, e.name));

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

// router.get("/path", ...middlewares, handler)
// Capture:
//  - method
//  - path
//  - args (until first closing paren); best-effort for handler name extraction
const METHOD_RE =
  /\brouter\.(get|post|put|delete|patch)\s*\(\s*(['"`])([^'"`]+)\2\s*,([\s\S]*?)\)\s*;?/gi;
// app.use("/api", router)
const USE_RE = /\bapp\.use\s*\(\s*(['"`])([^'"`]+)\1\s*,/gi;

const extractRouterRoutes = (content) => {
  const routes = [];
  let m;
  while ((m = METHOD_RE.exec(content))) {
    routes.push({
      method: m[1].toUpperCase(),
      path: m[3],
      args: m[4] || "",
    });
  }
  return routes;
};

const guessMountPrefixesFromInit = (content) => {
  const prefixes = new Set();
  let m;
  while ((m = USE_RE.exec(content))) prefixes.add(m[2]);
  return prefixes.size ? [...prefixes] : [""];
};

const isInitFile = (content) =>
  /\bconst\s+init\w*Routes\b/.test(content) || /\bexport\s+default\s+init\w*Routes\b/.test(content);

const extractModelName = (content) => {
  const m = content.match(/\bmodelName:\s*['"`]([^'"`]+)['"`]/);
  return m ? m[1].trim() : null;
};

const extractAttributesFromInit = (content) => {
  const idx = content.indexOf(".init(");
  if (idx < 0) return null;
  const braceStart = content.indexOf("{", idx);
  if (braceStart < 0) return null;

  // Find matching } for the first object literal (attributes)
  let i = braceStart;
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return null;
  const obj = content.slice(braceStart, i + 1);

  // Extract top-level keys at depth=1
  const keys = [];
  depth = 0;
  inStr = null;
  esc = false;
  let token = "";
  let readingKey = false;

  const flush = () => {
    const k = token.trim();
    token = "";
    if (!k) return;
    const cleaned = k.replace(/^['"`]|['"`]$/g, "");
    if (cleaned) keys.push(cleaned);
  };

  for (let p = 0; p < obj.length; p++) {
    const ch = obj[p];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === inStr) inStr = null;
      if (readingKey) token += ch;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inStr = ch;
      if (readingKey) token += ch;
      continue;
    }
    if (ch === "{") {
      depth++;
      readingKey = depth === 1;
      continue;
    }
    if (ch === "}") {
      depth--;
      readingKey = depth === 1;
      continue;
    }
    if (depth !== 1) continue;

    if (readingKey) {
      if (ch === ":") {
        flush();
        readingKey = false;
      } else {
        token += ch;
      }
    } else {
      if (ch === ",") readingKey = true;
    }
  }

  return Array.from(new Set(keys))
    .map((k) => k.trim())
    .filter(Boolean);
};

const loadModelAttributes = () => {
  const map = new Map(); // modelName -> attrs[]
  for (const file of listModelFiles()) {
    const content = fs.readFileSync(file, "utf8");
    const modelName = extractModelName(content);
    const attrs = extractAttributesFromInit(content);
    if (modelName && attrs && attrs.length) map.set(modelName, attrs);
  }
  return map;
};

// Very small Swagger extractor:
// - Finds a swagger block for a given fullPath + method, extracts:
//   summary -> Description
//   requestBody.required/properties keys -> Params (best-effort)
//   first 200/201 response description -> Returns (best-effort)
const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractSwaggerInfo = ({ content, fullPath, method }) => {
  const m = method.toLowerCase();
  const p = escapeRe(fullPath);

  // Match a swagger section that contains `* <path>:` and then `*   <method>:`
  const blockRe = new RegExp(
    String.raw`\/\*\*[\s\S]*?@swagger[\s\S]*?\n\s*\*\s*${p}:\s*[\s\S]*?\n\s*\*\s*${m}:\s*([\s\S]*?)\*\/`,
    "i",
  );
  const blockMatch = content.match(blockRe);
  if (!blockMatch) return null;
  const block = blockMatch[1] || "";

  const summaryMatch = block.match(/^\s*\*\s*summary:\s*(.+)\s*$/im);
  const desc = summaryMatch ? summaryMatch[1].trim() : null;

  // Params best-effort: try `required: [a, b]` else list `properties:` keys (first few)
  let params = "NONE";
  const requiredList = block.match(/required:\s*\[([^\]]+)\]/i);
  if (requiredList) {
    params = requiredList[1]
      .split(",")
      .map((x) => x.replace(/['"`]/g, "").trim())
      .filter(Boolean)
      .join(", ");
  } else {
    const props = [];
    const propRe = /^\s*\*\s*([a-zA-Z0-9_]+):\s*$/gm;
    let pm;
    // only scan after `properties:` if present
    const startIdx = block.toLowerCase().indexOf("properties:");
    const scan = startIdx >= 0 ? block.slice(startIdx) : "";
    while (scan && (pm = propRe.exec(scan))) {
      const k = pm[1];
      if (!["type", "format", "example", "enum", "description"].includes(k)) props.push(k);
      if (props.length >= 8) break;
    }
    if (props.length) params = props.join(", ");
  }

  // Returns best-effort: first `200:` or `201:` description line
  let returns = null;
  const respDesc =
    block.match(/^\s*\*\s*(200|201):\s*$/im)?.[1] ||
    block.match(/^\s*\*\s*responses:\s*$/im)?.[0];
  // If a response section exists, find the first description after 200/201
  const respBlockMatch = block.match(/^\s*\*\s*(200|201):\s*[\s\S]*?^\s*\*\s*description:\s*(.+)\s*$/im);
  if (respBlockMatch && respBlockMatch[2]) returns = respBlockMatch[2].trim();
  else if (respDesc) returns = "200/201 response";

  return { description: desc, params, returns };
};

const titleFromHandler = (handler) => {
  const raw = String(handler ?? "").trim();
  if (!raw) return null;
  const last = raw.split(".").pop() || raw;
  const cleaned = last.replace(/[^\w$]/g, "");
  if (!cleaned) return null;
  // split camelCase/PascalCase to words
  const words = cleaned
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return null;
  // Uppercase first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ");
};

const titleFromMethodAndUrl = ({ method, url }) => {
  const m = String(method ?? "").toUpperCase();
  const u = String(url ?? "").replace(/^\/api\/?/, "/").replace(/\/+$/, "");
  const parts = u.split("/").filter(Boolean);
  if (parts.length === 0) return m === "GET" ? "Get root" : `${m} root`;

  // Drop leading "api" if it still exists
  if (parts[0] === "api") parts.shift();

  const hasParam = parts.some((p) => p.startsWith(":"));
  const last = parts[parts.length - 1] || "";
  const prev = parts[parts.length - 2] || "";

  const singular = (s) => (s.endsWith("s") ? s.slice(0, -1) : s);
  const nice = (s) =>
    s
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const resource = last.startsWith(":") ? singular(prev || "resource") : singular(last || "resource");

  if (m === "GET") {
    if (hasParam && last.startsWith(":")) return `Get ${nice(resource)} by ${last.slice(1)}`;
    // nested like /users/:userId/orders
    if (parts.includes("users") && parts.includes("orders")) return "Get user orders";
    return `Get ${nice(resource)}${parts.length > 1 && !last.startsWith(":") ? " list" : ""}`.trim();
  }
  if (m === "POST") {
    if (parts.includes("login")) return "Login";
    if (parts.includes("register")) return "Register";
    return `Create ${nice(resource)}`;
  }
  if (m === "PUT" || m === "PATCH") {
    return `Update ${nice(resource)}`;
  }
  if (m === "DELETE") {
    return `Delete ${nice(resource)}`;
  }
  return `${m} ${nice(resource)}`;
};

const extractHandlerName = (args) => {
  // Prefer explicit controller.handler references
  const s = String(args ?? "");
  const matches = [...s.matchAll(/([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\s*$/gm)];
  if (matches.length) {
    const m = matches[matches.length - 1];
    return `${m[1]}.${m[2]}`;
  }
  // Fallback: last identifier token (may be function name)
  const m2 = s.match(/([A-Za-z_$][\w$]*)\s*$/m);
  return m2 ? m2[1] : null;
};

const paramsFromUrlAndMethod = ({ url, method }) => {
  const params = [];
  const pathParams = [...String(url).matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  if (pathParams.length) params.push(...pathParams);
  return params.length ? params.join(", ") : "NONE";
};

const returnsDefault = () => "status, message, data";

const wrapCsv = (text) => {
  const s = String(text ?? "").trim();
  if (!s || s === "—" || s === "NONE") return s || "—";
  // Help Office Viewer wrap long cells: break after commas / pipes.
  return s
    .replace(/\s*\|\s*/g, " |\n")
    .replace(/\s*,\s*/g, ",\n")
    .replace(/\s*;\s*/g, ";\n");
};

const files = listJsFiles(ROUTES_DIR);
const collected = [];
const modelAttrs = loadModelAttributes();

const modelForRoute = (url) => {
  const u = String(url ?? "").toLowerCase();
  if (u.includes("/products")) return "Products";
  if (u.includes("/categories")) return "Categories";
  if (u.includes("/orders") || u.includes("/create-orders") || u.includes("/my-orders"))
    return "Orders";
  if (u.includes("/carts")) return "Carts";
  if (u.includes("/orderitems") || u.includes("/orders/:orderid/items")) return "Order_Items";
  if (u.includes("/cartitems") || u.includes("/cart-items")) return "Cart_Items";
  if (u.includes("/notifications")) return "Notifications";
  if (u.includes("/promo") && u.includes("voucher")) return "Promo_Vouchers";
  if (u.includes("/vouchers") || u.includes("/voucher")) return "Vouchers";
  if (u.includes("/conversations")) return "Conversations";
  if (u.includes("/messages") || u.includes("/chat")) return "Messages";
  if (u.includes("/users") || u.includes("/profile") || u.includes("/register")) return "Users";
  return null;
};

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const localRoutes = extractRouterRoutes(content);
  if (!localRoutes.length) continue;

  const prefixes = isInitFile(content) ? guessMountPrefixesFromInit(content) : ["/api"];
  for (const prefix of prefixes) {
    for (const r of localRoutes) {
      const fullPath = joinUrl(prefix, r.path);
      const swagger = extractSwaggerInfo({ content, fullPath, method: r.method }) || {};
      const handler = extractHandlerName(r.args);
      const inferredDesc = titleFromHandler(handler);
      const inferredPathParams = paramsFromUrlAndMethod({ url: fullPath, method: r.method });
      const modelName = modelForRoute(fullPath);
      const attrs =
        modelName && ["POST", "PUT", "PATCH"].includes(r.method) ? modelAttrs.get(modelName) : null;

      // Requirement: Params must be either NONE or full model attributes like sample.
      // - For POST/PUT/PATCH: if we can map to a model => list ALL attributes; else NONE.
      // - For GET/DELETE: use path params if any; else NONE.
      const inferredBodyParams =
        attrs && attrs.length ? attrs.join(", ") : "NONE";
      const inferredParamsFull = ["POST", "PUT", "PATCH"].includes(r.method)
        ? inferredBodyParams
        : inferredPathParams;

      const finalParams =
        swagger.params && swagger.params !== "NONE" ? swagger.params : inferredParamsFull;
      collected.push({
        method: r.method,
        url: fullPath,
        description:
          swagger.description ||
          inferredDesc ||
          titleFromMethodAndUrl({ method: r.method, url: fullPath }),
        params: wrapCsv(finalParams),
        returns:
          wrapCsv(
            swagger.returns ? swagger.returns : returnsDefault(),
          ),
        source: normalizeSlashes(path.relative(path.resolve(__dirname, ".."), file)),
      });
    }
  }
}

// Dedupe by method+url (ignore source duplicates), keep first.
const map = new Map();
for (const r of collected) {
  const k = `${r.method} ${r.url}`;
  if (!map.has(k)) map.set(k, r);
}
const routes = [...map.values()].sort((a, b) => {
  const p = a.url.localeCompare(b.url);
  if (p !== 0) return p;
  return a.method.localeCompare(b.method);
});

// Remove placeholder root routes that are not part of API spec table.
const filteredRoutes = routes.filter((r) => {
  const u = String(r.url ?? "").trim();
  return !["/", "/api", "/api/"].includes(u);
});

const header = ["Id", "URL", "Method", "Description", "Params", "Returns"];

// Column widths (twips) tuned for landscape A4 in Office Viewer
const COL_W = {
  id: 650,
  url: 2400,
  method: 1100,
  desc: 3400,
  params: 3300,
  returns: 2900,
};

const cell = (text, { bold = false, code = false, width } = {}) =>
  new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text ?? ""),
            bold,
            font: code ? "Consolas" : "Calibri",
            size: 20, // 10pt to fit more text in Office Viewer
          }),
        ],
      }),
    ],
  });

const table = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        cell(header[0], { bold: true, width: COL_W.id }),
        cell(header[1], { bold: true, width: COL_W.url }),
        cell(header[2], { bold: true, width: COL_W.method }),
        cell(header[3], { bold: true, width: COL_W.desc }),
        cell(header[4], { bold: true, width: COL_W.params }),
        cell(header[5], { bold: true, width: COL_W.returns }),
      ],
    }),
    ...filteredRoutes.map((r, idx) =>
      new TableRow({
        children: [
          cell(String(idx + 1), { width: COL_W.id }),
          cell(r.url, { code: true, width: COL_W.url }),
          cell(r.method, { width: COL_W.method }),
          cell(r.description, { width: COL_W.desc }),
          cell(r.params, { width: COL_W.params }),
          cell(r.returns, { width: COL_W.returns }),
        ],
      }),
    ),
  ],
});

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5"
          size: { orientation: PageOrientation.LANDSCAPE },
        },
      },
      children: [
        new Paragraph({
          text: "Bảng API Routes (trình bày theo mẫu)",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Nguồn: src/routes (tự động tổng hợp; ưu tiên Swagger, thiếu Swagger sẽ suy luận từ URL + handler)`,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        table,
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Ghi chú: Params mặc định lấy từ :param trên URL và thêm body cho POST/PUT/PATCH; Returns mặc định: status, message, data.",
            }),
          ],
        }),
      ],
    },
  ],
});

const outPath = path.resolve(__dirname, "..", "docs", "routes-like-sample-v4.docx");
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buf);
console.log(`Wrote ${outPath} (${filteredRoutes.length} routes)`);

