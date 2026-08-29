// Shared by middleware.js (Edge) and the nation layout (Server Component) — keep this Edge-safe (no Node APIs).

export const DEFAULT_NATION_HOST = 'nation.destinymissionglobal.org'

/**
 * '' when the request is on the nation subdomain (links should be prefix-free, e.g. "/partner"),
 * '/nation' when served from the main domain fallback (links need the prefix, e.g. "/nation/partner").
 */
export function getNationBase(host) {
  const nationHost = process.env.NATION_HOST || DEFAULT_NATION_HOST
  const normalizedHost = (host || '').split(':')[0]
  return normalizedHost === nationHost ? '' : '/nation'
}
