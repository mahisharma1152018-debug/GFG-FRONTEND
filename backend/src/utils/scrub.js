/*
 * Privacy: GitHub e-mail addresses must never leave the API.
 * We no longer store them, and this strips any that were stored by older
 * versions (recursively removes every "email" key from JSON responses).
 */
const isPlain = (value) => {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

function stripEmails(value) {
  if (Array.isArray(value)) return value.map(stripEmails);
  if (!isPlain(value)) return value; // Dates, ObjectIds, etc. are left alone
  const out = {};
  for (const [key, inner] of Object.entries(value)) {
    if (key.toLowerCase() === "email") continue;
    out[key] = stripEmails(inner);
  }
  return out;
}

function scrubEmails(req, res, next) {
  const json = res.json.bind(res);
  res.json = (body) => json(stripEmails(body));
  next();
}

module.exports = { stripEmails, scrubEmails };
