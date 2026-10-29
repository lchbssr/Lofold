import { useSyncExternalStore } from 'react'

/** False on the iPhone, where only videos can go full screen */
export function canGoFullscreen(): boolean {
  return document.fullscreenEnabled
}

export function toggleFullscreen() {
  const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
  // Refused by the browser (no user gesture, setting): the page simply stays as it is
  request.catch(() => {})
}

function subscribe(onChange: () => void) {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}

export function useIsFullscreen(): boolean {
  return useSyncExternalStore(subscribe, () => document.fullscreenElement !== null)
}
