import { Maximize, Minimize } from 'lucide-react'
import { useMessages } from '../i18n/messages'
import { SMALL_BUTTON } from './buttonStyles'
import { canGoFullscreen, toggleFullscreen, useIsFullscreen } from './fullscreen'

export function FullscreenButton() {
  const isFullscreen = useIsFullscreen()
  const t = useMessages().player

  if (!canGoFullscreen()) {
    return null
  }

  const label = isFullscreen ? t.leaveFullscreen : t.fullscreen

  return (
    <button type="button" onClick={toggleFullscreen} aria-label={label} title={label} className={`${SMALL_BUTTON} text-stone-400`}>
      {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
    </button>
  )
}
