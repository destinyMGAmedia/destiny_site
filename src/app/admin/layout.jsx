// Bare wrapper — auth is handled per route group below
export const metadata = {
  title: { default: 'Admin', template: '%s | DMGA Admin' },
}

export default function AdminLayout({ children }) {
  return children
}
