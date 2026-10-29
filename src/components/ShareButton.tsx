import { Check, Link } from 'lucide-react'
import { useState } from 'react'
import { useMessages } from '../i18n/messages'
import { ROUND_BUTTON } from './buttonStyles'

interface ShareButtonProps {
  disabled: boolean
}

export function ShareButton({ disabled }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const t = useMessages().player

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (insecure context, permission refused): the link stays in the address bar
    }
  }

  const label = disabled ? t.cannotShare : copied ? t.shared : t.share

  return (
    <button
      type="button"
      onClick={copyLink}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={ROUND_BUTTON}
    >
      {copied ? <Check size={18} /> : <Link size={18} />}
    </button>
  )
}
