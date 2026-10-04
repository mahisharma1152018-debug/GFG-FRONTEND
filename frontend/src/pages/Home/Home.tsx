import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Hero } from '@/components/hero/Hero'
import { EventStats } from '@/components/home/EventStats'
import { HowItWorks } from '@/components/home/HowItWorks'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { XpSystem } from '@/components/home/XpSystem'
import { LeaderboardPreview } from '@/components/home/LeaderboardPreview'
import { AchievementPreview } from '@/components/home/AchievementPreview'
import { BadgeShowcase } from '@/components/home/BadgeShowcase'
import { GithubIntegration } from '@/components/home/GithubIntegration'
import { CommunityCta } from '@/components/home/CommunityCta'

export default function Home() {
  useDocumentTitle()

  return (
    <>
      <p className="sr-only">
        GEEKSTOBER — GFG Student Chapter RBU open-source contribution competition where merged pull requests earn XP
      </p>
      <Hero />
      <EventStats />
      <HowItWorks />
      <FeaturedProjects />
      <XpSystem />
      <LeaderboardPreview />
      <AchievementPreview />
      <BadgeShowcase />
      <GithubIntegration />
      <CommunityCta />
    </>
  )
}
