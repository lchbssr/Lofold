import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { setMediaArtwork } from '../audio/mediaSession'
import { useAmbianceStore } from '../store/ambianceStore'
import { ARTWORK_SIZE, renderArtwork } from './artwork'
import { PALETTES, paletteForHour } from './palettes'
import { PixelScene } from './PixelScene'
import { SCENES } from './scenes'

function useHour(): number {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const interval = setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return hour
}

/**
 * Draws the chosen scene behind the page. The light of the palette is also set as a CSS variable
 * on the whole page, so the interface shares its accent color with the scene.
 */
export function SceneBackdrop({ children }: { children: ReactNode }) {
  const { sceneId, paletteId, weatherId } = useAmbianceStore()
  const scene = SCENES.find((scene) => scene.id === sceneId) ?? SCENES[0]
  const hour = useHour()
  const shownId = paletteId === 'auto' ? paletteForHour(hour) : paletteId
  const palette = PALETTES.find((palette) => palette.id === shownId) ?? PALETTES[0]

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return
    }
    const src = renderArtwork(scene.draw, palette, weatherId, scene.artworkCenter)
    if (src) {
      setMediaArtwork(src, ARTWORK_SIZE)
    }
  }, [scene, palette, weatherId])

  return (
    <div className="scene relative isolate min-h-screen" style={{ '--scene-light': palette.light } as CSSProperties}>
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-night">
        <PixelScene draw={scene.draw} palette={palette} weather={weatherId} />
      </div>
      {children}
    </div>
  )
}
