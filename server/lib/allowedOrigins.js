const DEVELOPMENT_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];

export function getAllowedOrigins(frontendUrls, { production = false } = {}) {
  const configured = String(frontendUrls || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return production ? configured : [...new Set([...configured, ...DEVELOPMENT_ORIGINS])];
}

export function isAllowedOrigin(origin, allowedOrigins) {
  return !origin || allowedOrigins.includes(origin);
}
