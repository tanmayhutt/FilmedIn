export function getSafeRedirect(value: string | null, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  try {
    const parsed = new URL(value, window.location.origin)
    return parsed.origin === window.location.origin ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback
  } catch {
    return fallback
  }
}
