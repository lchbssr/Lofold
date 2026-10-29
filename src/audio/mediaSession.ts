interface MediaHandlers {
  play: () => void
  pause: () => void
  next: () => void
  previous: (() => void) | null
  seekTo: (seconds: number) => void
}

let artwork: MediaImage[] = []

export function setMediaArtwork(src: string, sizes: string) {
  artwork = [{ src, sizes, type: 'image/png' }]
  if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
    navigator.mediaSession.metadata.artwork = artwork
  }
}

export function updateMediaPosition(durationSeconds: number, positionSeconds: number) {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) {
    return
  }
  try {
    navigator.mediaSession.setPositionState({
      duration: durationSeconds,
      playbackRate: 1,
      position: Math.min(Math.max(0, positionSeconds), durationSeconds),
    })
  } catch {
    // Refused by the browser (inconsistent values): the lock screen just shows no progress
  }
}

export function updateMediaSession(title: string, album: string, isPlaying: boolean, handlers: MediaHandlers) {
  if (!('mediaSession' in navigator)) {
    return
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist: 'Lofold',
    album,
    artwork,
  })
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  navigator.mediaSession.setActionHandler('play', handlers.play)
  navigator.mediaSession.setActionHandler('pause', handlers.pause)
  navigator.mediaSession.setActionHandler('nexttrack', handlers.next)
  navigator.mediaSession.setActionHandler('previoustrack', handlers.previous)
  try {
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        handlers.seekTo(details.seekTime)
      }
    })
  } catch {
    // Older browsers do not know this action: the progress bar of the lock screen just cannot be dragged
  }
}
