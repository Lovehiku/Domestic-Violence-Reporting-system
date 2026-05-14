export const sanitizeText = (value) => String(value || "").replace(/[<>]/g, "").trim();

export const sanitizeBody = (body = {}) =>
  Object.fromEntries(Object.entries(body).map(([k, v]) => [k, typeof v === "string" ? sanitizeText(v) : v]));

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
