const now = () => new Date().toISOString();

const toMeta = (meta) => {
  if (!meta || typeof meta !== "object") return "";
  const pairs = Object.entries(meta)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`);
  return pairs.length ? ` ${pairs.join(" ")}` : "";
};

const write = (level, phase, message, meta) => {
  const prefix = `[socket][chat][${phase}]`;
  const line = `${now()} ${prefix} ${message}${toMeta(meta)}`;
  if (level === "error") return console.error(line);
  if (level === "warn") return console.warn(line);
  return console.log(line);
};

export const socketLogger = {
  info: (phase, message, meta) => write("info", phase, message, meta),
  warn: (phase, message, meta) => write("warn", phase, message, meta),
  error: (phase, message, meta) => write("error", phase, message, meta),
};
