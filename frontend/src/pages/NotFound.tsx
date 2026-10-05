import { ArrowLeft } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Panel'
import { TerminalWindow } from '@/components/github/TerminalWindow'

const LINES = [
  { kind: 'command', text: 'geekstober open unknown-route' },
  { kind: 'output', text: 'fatal: route not found' },
  { kind: 'accent', text: 'hint: check /projects or /leaderboard' },
] as const

export default function NotFound() {
  useDocumentTitle('Not found')

  return (
    <Container className="py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-dim">error 404</p>
      <h1 className="mt-4 font-pixel text-2xl sm:text-3xl lg:text-4xl text-ink">
        THIS BRANCH DOESN&apos;T EXIST
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-muted">
        The page you asked for was never merged. Head back to the registry and pick a repository that is.
      </p>

      <div className="mx-auto mt-8 max-w-md text-left">
        <TerminalWindow lines={[...LINES]} typed={false} />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/" icon={<ArrowLeft className="size-4" aria-hidden />}>
          Back home
        </ButtonLink>
        <ButtonLink to="/projects" variant="outline">
          Browse projects
        </ButtonLink>
      </div>
    </Container>
  )
}
