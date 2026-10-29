import { Download, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useMessages } from '../i18n/messages'
import { usePlayerStore } from '../store/playerStore'
import { SMALL_BUTTON } from './buttonStyles'
import { useSongName } from './useSongName'

function fileSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function DownloadButton() {
  const [isRendering, setIsRendering] = useState(false)
  const [failed, setFailed] = useState(false)
  const name = useSongName()
  const t = useMessages().player

  const download = async () => {
    const { song, effects } = usePlayerStore.getState()
    setIsRendering(true)
    setFailed(false)

    try {
      const { renderWav } = await import('../audio/render')
      const url = URL.createObjectURL(await renderWav(song, effects))
      const link = document.createElement('a')
      link.href = url
      link.download = ['lofold', fileSlug(name), song.seed].filter(Boolean).join('-') + '.wav'
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setFailed(true)
    } finally {
      setIsRendering(false)
    }
  }

  const label = isRendering ? t.renderingTrack : failed ? t.downloadFailed : t.download

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span aria-live="polite" className="text-xs text-stone-400">
        {isRendering && t.rendering}
      </span>
      <button
        type="button"
        onClick={download}
        disabled={isRendering}
        aria-label={label}
        title={label}
        className={`${SMALL_BUTTON} disabled:cursor-wait ${failed ? 'text-red-300' : 'text-stone-400'}`}
      >
        {isRendering ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
      </button>
    </div>
  )
}
