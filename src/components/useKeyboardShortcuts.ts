import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { canGoFullscreen, toggleFullscreen } from './fullscreen'

function isEditing(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || target.closest('input, select, textarea') !== null)
}

function isTextField(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement) {
    return !['range', 'checkbox', 'radio', 'button'].includes(target.type)
  }
  return target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable)
}

function undoAction(event: KeyboardEvent, isEditorOpen: boolean): (() => void) | null {
  if (!isEditorOpen || !(event.ctrlKey || event.metaKey) || event.altKey || isTextField(event.target)) {
    return null
  }
  const { undo, redo } = usePlayerStore.getState()
  const key = event.key.toLowerCase()
  if (key === 'z') return event.shiftKey ? redo : undo
  if (key === 'y') return redo
  return null
}

const VOLUME_STEP = 0.1

function isPressable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest('button, a') !== null
}

interface ShortcutsOptions {
  isEditorOpen: boolean
  onShowHelp: () => void
}

/**
 * Space plays or pauses, the left and right arrows move to the previous or next track (by one bar with Shift),
 * M mutes, F switches to full screen, ? shows the help. Two shortcuts depend on the editor:
 * - Ctrl+Z undoes a change only while it is open, otherwise the track would change with nothing on screen to tell why
 * - the up and down arrows set the volume only while it is closed, since they scroll the page when it is open
 */
export function useKeyboardShortcuts({ isEditorOpen, onShowHelp }: ShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // The help dialog keeps the keys for itself (Escape closes it)
      if (document.querySelector('dialog[open]')) {
        return
      }
      const undoOrRedo = undoAction(event, isEditorOpen)
      if (undoOrRedo) {
        event.preventDefault()
        undoOrRedo()
        return
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || isEditing(event.target)) {
        return
      }
      const { togglePlay, previousSong, nextSong, moveByBars, toggleMute, setVolume } = usePlayerStore.getState()
      const changeVolume = (change: number) => () => {
        const volume = Math.min(1, Math.max(0, usePlayerStore.getState().volume + change))
        setVolume(Math.round(volume * 100) / 100)
      }
      const actions: Record<string, () => void> = event.shiftKey
        ? { ArrowLeft: () => moveByBars(-1), ArrowRight: () => moveByBars(1) }
        : { ArrowLeft: previousSong, ArrowRight: nextSong, m: toggleMute }
      actions['?'] = onShowHelp
      if (!isEditorOpen) {
        actions.ArrowUp = changeVolume(VOLUME_STEP)
        actions.ArrowDown = changeVolume(-VOLUME_STEP)
      }
      if (!isPressable(event.target)) {
        actions[' '] = () => void togglePlay()
      }
      if (canGoFullscreen()) {
        actions.f = toggleFullscreen
      }

      const action = actions[event.key.length === 1 ? event.key.toLowerCase() : event.key]
      if (action) {
        // Space would also scroll the page
        event.preventDefault()
        action()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isEditorOpen, onShowHelp])
}
