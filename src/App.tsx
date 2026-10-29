import { SlidersHorizontal } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Editor } from './components/editor/Editor'
import { Key } from './components/Key'
import { LanguagePicker } from './components/LanguagePicker'
import { NowPlaying } from './components/NowPlaying'
import { Player } from './components/Player'
import { ShortcutsDialog } from './components/ShortcutsDialog'
import { useIdle } from './components/useIdle'
import { useKeyboardShortcuts } from './components/useKeyboardShortcuts'
import { useSongName } from './components/useSongName'
import { useMessages } from './i18n/messages'
import { SceneBackdrop } from './scenes/SceneBackdrop'
import { useLanguageStore } from './store/languageStore'
import { isCustomSong, usePlayerStore } from './store/playerStore'

const IDLE_DELAY_MS = 5000

// iPadOS presents itself as a Mac: its touch screen tells it apart
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const showHelp = useCallback(() => setIsHelpOpen(true), [])
  const isCustom = usePlayerStore(isCustomSong)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const language = useLanguageStore((state) => state.language)
  const t = useMessages().app
  const name = useSongName()
  const isIdle = useIdle(IDLE_DELAY_MS, isPlaying && !isEditorOpen)
  useKeyboardShortcuts({ isEditorOpen, onShowHelp: showHelp })

  useEffect(() => {
    document.title = `${name} · Lofold`
  }, [name])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // The cursor hides with the interface; the scene behind is outside <main>, so it is hidden on the whole page
  useEffect(() => {
    document.documentElement.classList.toggle('cursor-none', isIdle)
  }, [isIdle])

  return (
    <SceneBackdrop>
      <main
        className={`flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12 sm:px-6 transition-opacity duration-700 motion-reduce:transition-none ${isIdle ? 'pointer-events-none opacity-0' : ''}`}
      >
        <div className="text-center drop-shadow-lg">
          <h1 className="text-5xl font-bold tracking-tight text-white">Lofold</h1>
          <p className="mt-3 text-white/80">{t.tagline}</p>
        </div>

        <Player />

        <button
          type="button"
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          aria-expanded={isEditorOpen}
          className="flex items-center gap-2 rounded-full bg-night/60 px-5 py-2 text-sm text-white backdrop-blur-md transition-colors hover:bg-night/80"
        >
          <SlidersHorizontal size={16} />
          {isEditorOpen ? t.closeEditor : t.openEditor}
        </button>

        {isEditorOpen && <Editor />}

        <div className="max-w-md space-y-2 text-center text-xs text-white/70 drop-shadow">
          <p>
            {t.backgroundPlay} {isCustom ? t.customLoops : t.nextStarts} {t.idleHint}
          </p>
          {/* Safari suspends the audio of web pages with the screen: better to say it than to let it look broken */}
          {IS_IOS && <p>{t.iosWarning}</p>}
          <button type="button" onClick={showHelp} className="hidden underline-offset-2 hover:text-white hover:underline pointer-fine:inline">
            {t.shortcuts} <Key>?</Key>
          </button>
          <LanguagePicker />
        </div>
      </main>

      <NowPlaying visible={isIdle} />
      <ShortcutsDialog open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </SceneBackdrop>
  )
}

export default App
