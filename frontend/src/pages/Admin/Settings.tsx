import { useForm } from 'react-hook-form'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { SITE_CONFIG } from '@/config/site'

interface SettingsForm {
  eventName: string
  window: string
  venue: string
  contact: string
  githubOrg: string
  discord: string
  scoringMode: 'manual' | 'auto'
  weeklyReset: 'enabled' | 'disabled'
  registration: 'open' | 'invite-only' | 'closed'
  notes: string
}

export default function AdminSettings() {
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettingsForm>({
    defaultValues: {
      eventName: SITE_CONFIG.name,
      window: SITE_CONFIG.dates,
      venue: SITE_CONFIG.venue,
      contact: SITE_CONFIG.email,
      githubOrg: SITE_CONFIG.githubUrl,
      discord: SITE_CONFIG.discordUrl,
      scoringMode: 'manual',
      weeklyReset: 'enabled',
      registration: 'open',
      notes: 'Scoring decisions stay with project admins until the GitHub App analysis goes live.',
    },
  })

  const onSubmit = handleSubmit(async () => {
    // TODO: Connect admin CRUD API — PUT /admin/settings
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success('Settings saved')
  })

  return (
    <form className="space-y-5" onSubmit={(event) => void onSubmit(event)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
            <SettingsIcon className="size-5 text-brand-bright" aria-hidden />
            Settings
          </h1>
          <p className="mt-1 font-mono text-xs text-dim">event configuration · signed in as @{user?.username}</p>
        </div>
        <Button type="submit" loading={isSubmitting} icon={<Save className="size-4" aria-hidden />}>
          Save settings
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">event details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Event name" htmlFor="s-name">
              <Input id="s-name" {...register('eventName')} />
            </Field>
            <Field label="Window" htmlFor="s-window">
              <Input id="s-window" {...register('window')} />
            </Field>
            <Field label="Venue / format" htmlFor="s-venue">
              <Input id="s-venue" {...register('venue')} />
            </Field>
            <Field label="Contact email" htmlFor="s-contact">
              <Input id="s-contact" type="email" {...register('contact')} />
            </Field>
            <Field label="GitHub organisation" htmlFor="s-github">
              <Input id="s-github" {...register('githubOrg')} />
            </Field>
            <Field label="Discord invite" htmlFor="s-discord">
              <Input id="s-discord" {...register('discord')} />
            </Field>
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">competition rules</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Scoring mode" htmlFor="s-scoring" hint="Manual keeps maintainers in control of every award.">
              <Select id="s-scoring" {...register('scoringMode')}>
                <option value="manual">Manual — maintainers classify each PR</option>
                <option value="auto">Auto — GitHub App classifies on merge</option>
              </Select>
            </Field>

            <Field label="Weekly leaderboard reset" htmlFor="s-weekly">
              <Select id="s-weekly" {...register('weeklyReset')}>
                <option value="enabled">Enabled — resets every Monday</option>
                <option value="disabled">Disabled — cumulative only</option>
              </Select>
            </Field>

            <Field label="Registration" htmlFor="s-registration">
              <Select id="s-registration" {...register('registration')}>
                <option value="open">Open — anyone with GitHub can join</option>
                <option value="invite-only">Invite only</option>
                <option value="closed">Closed</option>
              </Select>
            </Field>

            <Field label="Internal notes" htmlFor="s-notes" hint="Visible to admins only.">
              <Textarea id="s-notes" rows={4} {...register('notes')} />
            </Field>
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">danger zone</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-rose/30 bg-rose/[0.05] p-4">
          <div>
            <p className="text-sm font-semibold text-ink">Freeze the competition</p>
            <p className="mt-1 text-sm text-muted">Blocks new submissions while keeping the leaderboard readable.</p>
          </div>
          <Button type="button" variant="danger" size="sm" onClick={() => toast.success('Submissions frozen')}>
            Freeze submissions
          </Button>
        </div>
        <p className="mt-4 font-mono text-[11px] text-dim">
          // TODO: Connect admin CRUD API · PUT /admin/settings
        </p>
      </Panel>
    </form>
  )
}
