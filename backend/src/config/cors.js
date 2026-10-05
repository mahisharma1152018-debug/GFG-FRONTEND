// CORS_ORIGIN=https://app.example.com,http://localhost:5173
function allowedOrigins() {
  return (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

module.exports = { allowedOrigins };
