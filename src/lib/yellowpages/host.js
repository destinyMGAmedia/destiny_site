// Shared by src/proxy.js (Edge) — keep this Edge-safe (no Node APIs).
// Mirrors src/lib/nation/host.js's shape for the Destiny Nation subdomain.

export const DEFAULT_YELLOWPAGES_HOST = 'theyellowpages.destinymissionglobal.org'

/**
 * '' when the request is on the yellow pages subdomain (links should be prefix-free, e.g.
 * "/search"), '/yellowpages' when served from the main domain fallback (links need the
 * prefix, e.g. "/yellowpages/search").
 */
export function getYellowPagesBase(host) {
  const yellowPagesHost = process.env.YELLOWPAGES_HOST || DEFAULT_YELLOWPAGES_HOST
  const normalizedHost = (host || '').split(':')[0]
  return normalizedHost === yellowPagesHost ? '' : '/yellowpages'
}
