import { useEffect, useRef } from 'react'
import type { Frame } from './frame'
import { mixSceneColors, sceneColors, type Palette, type SceneColors } from './palettes'
import { HEIGHT, WIDTH } from './pixel'
import type { WeatherId } from './weather'

// A low frame rate suits pixel art and spares the battery. Fades play at the rate of the screen to stay smooth,
// while the animations (rain, snow, stars…) keep moving at this rate.
const FRAME_INTERVAL_MS = 1000 / 12
const PALETTE_FADE_MS = 1200
const CROSSFADE_MS = 700

interface Look {
  draw: (frame: Frame) => void
  weather: WeatherId
}

interface PixelSceneProps extends Look {
  palette: Palette
}

function progress(now: number, start: number, duration: number): number {
  return duration === 0 ? 1 : Math.min(1, Math.max(0, (now - start) / duration))
}

function easeInOut(t: number): number {
  return t * t * (3 - 2 * t)
}

export function PixelScene({ draw, palette, weather }: PixelSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Read by the animation loop, which keeps running while they change
  const look = useRef<Look>({ draw, weather })
  const initialColors = sceneColors(palette)
  const shownColors = useRef<SceneColors>(initialColors)
  const paletteFade = useRef({ palette, from: initialColors, to: initialColors, start: -Infinity })
  const crossfade = useRef<{ previous: Look; start: number } | null>(null)
  const changed = useRef(true)

  useEffect(() => {
    if (paletteFade.current.palette !== palette) {
      paletteFade.current = { palette, from: shownColors.current, to: sceneColors(palette), start: performance.now() }
      changed.current = true
    }
  }, [palette])

  useEffect(() => {
    const previous = look.current
    if (previous.draw !== draw || previous.weather !== weather) {
      crossfade.current = { previous, start: performance.now() }
      look.current = { draw, weather }
      changed.current = true
    }
  }, [draw, weather])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    const previousCanvas = document.createElement('canvas')
    previousCanvas.width = WIDTH
    previousCanvas.height = HEIGHT
    const previousCtx = previousCanvas.getContext('2d')
    if (!ctx || !previousCtx) {
      return
    }

    // Without motion, changes happen at once and the picture stays still
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const paletteFadeMs = reducedMotion ? 0 : PALETTE_FADE_MS
    const crossfadeMs = reducedMotion ? 0 : CROSSFADE_MS

    const render = (now: number) => {
      const fade = paletteFade.current
      const colors = mixSceneColors(fade.from, fade.to, easeInOut(progress(now, fade.start, paletteFadeMs)))
      shownColors.current = colors
      // The animations move in steps, even while a fade is drawn on every frame of the screen
      const time = reducedMotion ? 0 : (Math.floor(now / FRAME_INTERVAL_MS) * FRAME_INTERVAL_MS) / 1000
      look.current.draw({ ctx, colors, weather: look.current.weather, time })

      const blend = crossfade.current
      if (blend) {
        const done = progress(now, blend.start, crossfadeMs)
        if (done < 1) {
          blend.previous.draw({ ctx: previousCtx, colors, weather: blend.previous.weather, time })
          ctx.globalAlpha = 1 - easeInOut(done)
          ctx.drawImage(previousCanvas, 0, 0)
          ctx.globalAlpha = 1
        } else {
          crossfade.current = null
        }
      }
    }

    let request = 0
    let lastRender = -Infinity
    const loop = (now: number) => {
      request = requestAnimationFrame(loop)
      const isFading =
        now < paletteFade.current.start + paletteFadeMs || (crossfade.current !== null && now < crossfade.current.start + crossfadeMs)
      const isDue = !reducedMotion && now - lastRender >= FRAME_INTERVAL_MS

      if (changed.current || isFading || isDue) {
        changed.current = false
        lastRender = now
        render(now)
      }
    }
    request = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(request)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="h-full w-full object-cover object-bottom [image-rendering:pixelated]"
    />
  )
}
