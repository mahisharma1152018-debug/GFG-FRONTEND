import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'

export interface TerminalLine {
  kind: 'command' | 'output' | 'success' | 'accent'
  text: string
}

interface TerminalWindowProps {
  lines: TerminalLine[]
  className?: string
  title?: string
  /** Type the commands out one by one when the window scrolls into view. */
  typed?: boolean
}

const KIND_CLASS: Record<TerminalLine['kind'], string> = {
  command: 'text-ink',
  output: 'text-muted',
  success: 'text-mint',
  accent: 'text-brand-bright',
}

/**
 * Terminal window decoration — the core "open source atmosphere" element.
 * Purely presentational, announced as a live region only for typed mode.
 */
export function TerminalWindow({ lines, className, title = 'geekstober — zsh', typed = true }: TerminalWindowProps) {
  const [visibleCount, setVisibleCount] = useState(typed ? 0 : lines.length)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    if (!typed) return
    let cancelled = false
    let index = 0

    const next = () => {
      if (cancelled || index >= lines.length) return
      const line = lines[index]
      if (!line) return

      if (line.kind === 'command') {
        let char = 0
        const type = () => {
          if (cancelled) return
          char += 1
          setTypedText(line.text.slice(0, char))
          if (char < line.text.length) {
            setTimeout(type, 26)
          } else {
            setVisibleCount((count) => Math.max(count, index + 1))
            setTypedText('')
            index += 1
            setTimeout(next, 420)
          }
        }
        type()
      } else {
        setVisibleCount((count) => Math.max(count, index + 1))
        index += 1
        setTimeout(next, 240)
      }
    }

    const timer = setTimeout(next, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [lines, typed])

  const showTyping = typed && visibleCount < lines.length

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-line bg-gradient-to-b from-[#0a110b] to-[#060a06] shadow-[0_30px_60px_-40px_rgb(34_197_94_/_0.5)]',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-line bg-white/[0.02] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-brand/70" aria-hidden />
        <span className="ml-2 truncate font-mono text-[11px] text-dim">{title}</span>
      </div>

      <div className="space-y-1.5 px-4 py-4 font-mono text-[12.5px] leading-relaxed sm:text-[13px]">
        {lines.slice(0, visibleCount).map((line, index) => (
          <p key={index} className={cn('break-words', KIND_CLASS[line.kind])}>
            {line.kind === 'command' ? <span className="mr-2 text-brand-bright">❯</span> : null}
            {line.kind === 'success' ? <span className="mr-2 text-brand-bright">✓</span> : null}
            {line.text}
          </p>
        ))}

        {showTyping ? (
          <p className="text-ink">
            <span className="mr-2 text-brand-bright">❯</span>
            {typedText}
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-brand-bright" aria-hidden />
          </p>
        ) : null}
      </div>
    </div>
  )
}
