export function setUrlParams(params: Record<string, string | null>) {
  const url = new URL(window.location.href)
  for (const [name, value] of Object.entries(params)) {
    if (value === null) {
      url.searchParams.delete(name)
    } else {
      url.searchParams.set(name, value)
    }
  }
  window.history.replaceState(null, '', url)
}
