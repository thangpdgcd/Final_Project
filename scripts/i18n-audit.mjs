import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = path.resolve(process.cwd());

const SRC_DIR = path.join(workspaceRoot, 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'translates', 'locales');

const EN_PATH = path.join(LOCALES_DIR, 'en.json');
const VI_PATH = path.join(LOCALES_DIR, 'vi.json');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const flattenJsonKeys = (value, prefix = '') => {
  const keys = new Set();
  const visit = (v, p) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) {
      // For arrays, treat the array itself as a translatable leaf (e.g. home.hero).
      // Also walk items in case they are objects/strings with further paths.
      keys.add(p);
      v.forEach((item, idx) => {
        const itemPrefix = `${p}.${idx}`;
        // i18next dot-notation for numeric indices is not guaranteed; still, keeping
        // deeper paths lets us catch nested structures.
        if (typeof item === 'object' && item !== null) {
          visit(item, itemPrefix);
        } else {
          // Primitive arrays: enable dot-notation access (e.g. bullets.0).
          keys.add(itemPrefix);
        }
      });
      return;
    }
    if (typeof v === 'object') {
      const isEmptyObject = Object.keys(v).length === 0;
      if (isEmptyObject) keys.add(p);
      for (const [k, child] of Object.entries(v)) {
        const next = p ? `${p}.${k}` : k;
        visit(child, next);
      }
      return;
    }
    // primitives: treat the path as a leaf.
    keys.add(p);
  };
  visit(value, prefix);
  // Remove empty prefix entry.
  keys.delete('');
  return keys;
};

const readDirRecursive = (dirPath) => {
  const results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) results.push(...readDirRecursive(fullPath));
    else results.push(fullPath);
  }
  return results;
};

const isTextFile = (filePath) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath);

// public/auth scope: include customer-facing and auth screens, exclude admin/system pages.
const isInScopePublicAuth = (filePath) => {
  const rel = path.relative(SRC_DIR, filePath).replaceAll('\\', '/');
  if (!rel.startsWith('pages/')) return rel.startsWith('components/');
  // pages/*:
  if (rel.startsWith('pages/system/') || rel.startsWith('pages/systems/')) return false;
  if (rel.includes('/system/')) return false;
  if (rel.includes('/systems/')) return false;
  return true;
};

const collectUsedTranslationKeys = (filePaths) => {
  const used = new Set();

  const TRANSLATION_KEY_PREFIXES = [
    'common',
    'nav',
    'home',
    'cart',
    'auth',
    'profile',
    'footer',
    'about',
    'products',
    'payment',
  ];

  const isLikelyTranslationKey = (key) => {
    if (typeof key !== 'string') return false;
    if (TRANSLATION_KEY_PREFIXES.some((p) => key === p)) return true;
    if (TRANSLATION_KEY_PREFIXES.some((p) => key.startsWith(`${p}.`))) return true;
    if (
      TRANSLATION_KEY_PREFIXES.some((p) => {
        if (!key.startsWith(p) || key.length === p.length) return false;
        const next = key[p.length];
        return /[A-Z0-9]/.test(next);
      })
    ) {
      return true;
    }
    return false;
  };

  const tCall = /t\(\s*['"]([^'"]+)['"]/g;
  const labelKeyLiteral = /label\s*:\s*['"]((?:common|nav|home|cart|auth|profile|footer|about|products|payment)\.[a-zA-Z0-9_.-]+)['"]/g;
  const keyInStringLiteral = /['"]((?:common|nav|home|cart|auth|profile|footer|about|products|payment)\.[a-zA-Z0-9_.-]+)['"]/g;

  for (const filePath of filePaths) {
    const text = fs.readFileSync(filePath, 'utf8');

    let m;
    while ((m = tCall.exec(text))) {
      const key = m[1];
      if (isLikelyTranslationKey(key)) used.add(key);
    }
    while ((m = labelKeyLiteral.exec(text))) used.add(m[1]);
    while ((m = keyInStringLiteral.exec(text))) used.add(m[1]);

    // Also: changeLanguage is string literal, but that's not a translation key.
    // No-op.
  }

  return used;
};

const collectHardcodedTextCandidates = (filePaths) => {
  const candidates = [];

  // Heuristics: flag string literals in commonly user-visible props/calls.
  const isLikelyTranslationKeyLiteral = (str) => {
    if (typeof str !== 'string') return false;
    // E.g. `auth.loginSubmit` / `common.lang.vi`
    return /^[a-z]+(\.[A-Za-z0-9_-]+)+$/.test(str);
  };

  const isLikelyTailwindOrClassNameLike = (str) => {
    if (typeof str !== 'string') return false;
    // E.g. `bg-[#4B3621]`, `flex items-center`, etc.
    return (
      /[#\[\]]/.test(str) ||
      /\b(bg-|text-|w-|h-|p-|m-|rounded|shadow|flex|grid|uppercase|tracking|transition|rotate-|scale-|cursor-|scrollbar-)/.test(
        str,
      ) ||
      /dark:|sm:|md:|lg:/.test(str)
    );
  };

  const isLikelyNoise = (str) => {
    if (!str) return true;
    if (typeof str !== 'string') return true;

    // Ignore translation key literals (not UI text).
    if (isLikelyTranslationKeyLiteral(str)) return true;

    // Ignore route/path-like strings and element ids/classes.
    if (str.startsWith('/')) return true;
    if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(str)) return true; // e.g. explore-flavors__avatar-ish

    // Ignore phone/number-only examples.
    if (/^[+0-9][0-9\s-]*$/.test(str)) return true;

    // Ignore password mask/bullet-like placeholders.
    if (/^[•·]+$/.test(str)) return true;
    if (/^[0xX]+$/.test(str)) return true;

    // Ignore tailwind / className fragments captured by overly broad regexes.
    if (isLikelyTailwindOrClassNameLike(str)) return true;

    return false;
  };

  const patterns = [
    { name: 'message.success', re: /message\.(success|error)\(\s*['"]([^'"]{2,})['"]/g },
    { name: 'placeholder', re: /placeholder\s*=\s*['"]([^'"]{2,})['"]/g },
    { name: 'title/aria', re: /(title|aria-label)\s*=\s*['"]([^'"]{2,})['"]/g },
  ];

  for (const filePath of filePaths) {
    const rel = path.relative(workspaceRoot, filePath);
    const text = fs.readFileSync(filePath, 'utf8');

    // Quick ignore for minified / huge files.
    if (text.length > 350_000) continue;

    for (const { name, re } of patterns) {
      let m;
      while ((m = re.exec(text))) {
        if (name === 'message.success') {
          const kind = m[1];
          const str = m[2];
          if (
            str &&
            !/^https?:\/\//i.test(str) &&
            !/@/.test(str) &&
            !/^[0-9]+$/.test(str) &&
            !isLikelyNoise(str)
          ) {
            candidates.push({ file: rel, pattern: `message.${kind}`, value: str });
          }
        } else if (m[1] && m[2]) {
          const str = m[2];
          if (
            str &&
            !/^https?:\/\//i.test(str) &&
            !/@/.test(str) &&
            !/^[0-9]+$/.test(str) &&
            !isLikelyNoise(str)
          ) {
            candidates.push({ file: rel, pattern: name, value: str });
          }
        } else if (m[1]) {
          const str = m[1];
          if (
            str &&
            !/^https?:\/\//i.test(str) &&
            !/@/.test(str) &&
            !/^[0-9]+$/.test(str) &&
            !isLikelyNoise(str)
          ) {
            candidates.push({ file: rel, pattern: name, value: str });
          }
        }
      }
    }
  }

  // De-dup by (file, pattern, value)
  const uniq = new Map();
  for (const c of candidates) {
    const key = `${c.file}::${c.pattern}::${c.value}`;
    uniq.set(key, c);
  }
  return [...uniq.values()];
};

const main = () => {
  const [en, vi] = [readJson(EN_PATH), readJson(VI_PATH)];

  const enKeys = flattenJsonKeys(en);
  const viKeys = flattenJsonKeys(vi);

  const allSrcFiles = readDirRecursive(SRC_DIR).filter(isTextFile);
  const scopeFiles = allSrcFiles.filter(isInScopePublicAuth);
  const usedKeys = collectUsedTranslationKeys(scopeFiles);

  // Compare:
  const missingInEn = [...usedKeys].filter((k) => !enKeys.has(k));
  const missingInVi = [...usedKeys].filter((k) => !viKeys.has(k));

  const hardcodedCandidates = collectHardcodedTextCandidates(scopeFiles);

  const output = {
    summary: {
      usedKeysCount: usedKeys.size,
      enKeysCount: enKeys.size,
      viKeysCount: viKeys.size,
      missingInEnCount: missingInEn.length,
      missingInViCount: missingInVi.length,
      hardcodedCandidatesCount: hardcodedCandidates.length,
    },
    missingInEn: missingInEn.sort(),
    missingInVi: missingInVi.sort(),
    hardcodedCandidates: hardcodedCandidates
      .sort((a, b) => a.file.localeCompare(b.file) || a.pattern.localeCompare(b.pattern) || a.value.localeCompare(b.value))
      .slice(0, 2000),
    notes: [
      'This audit uses regex heuristics; it may miss dynamic t(key) usage or over-flag some UI strings.',
      'Use the missingInEn/missingInVi lists as the hard blocker; treat hardcodedCandidates as a to-translate shortlist.',
    ],
  };

  const reportPath = path.join(workspaceRoot, 'scripts', 'i18n-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(output, null, 2), 'utf8');

  // Also print a short console summary.
  console.log('[i18n-audit] Done');
  console.log(`[i18n-audit] usedKeys: ${output.summary.usedKeysCount}`);
  console.log(`[i18n-audit] missingInEn: ${output.summary.missingInEnCount}`);
  console.log(`[i18n-audit] missingInVi: ${output.summary.missingInViCount}`);
  console.log(`[i18n-audit] hardcodedCandidates (scoped): ${output.summary.hardcodedCandidatesCount}`);
  console.log(`[i18n-audit] Report: ${path.relative(workspaceRoot, reportPath)}`);
  if (output.summary.missingInEnCount > 0 || output.summary.missingInViCount > 0) {
    console.log('[i18n-audit] Missing keys detected. See report for details.');
    process.exitCode = 1;
  }
};

main();

