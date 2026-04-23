function normalizeHex(color) {
  if (!color || typeof color !== "string") return "";
  let c = color.trim().toLowerCase();
  if (!c.startsWith("#")) return c;
  if (c.length === 4) {
    c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  }
  return c;
}

module.exports = {
  normalizeHex
};
