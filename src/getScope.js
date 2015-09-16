

export default function getScope() {
  const scope$$ = window.__livereactload$$ || {modules: {}, proxies: {}}
  window.__livereactload$$ = scope$$
  return scope$$
}
