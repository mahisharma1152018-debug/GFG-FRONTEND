import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth } from '@/routes/RequireAuth'

/* Public pages — lazily loaded so the landing page ships a small bundle. */
const Home = lazy(() => import('@/pages/Home/Home'))
const Projects = lazy(() => import('@/pages/Projects/Projects'))
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails/ProjectDetails'))
const Leaderboard = lazy(() => import('@/pages/Leaderboard/Leaderboard'))
const Rules = lazy(() => import('@/pages/Rules/Rules'))
const Badges = lazy(() => import('@/pages/Badges/Badges'))
const HowItWorks = lazy(() => import('@/pages/HowItWorks/HowItWorks'))
const About = lazy(() => import('@/pages/About/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/* Participant workspace */
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'))
const Progress = lazy(() => import('@/pages/Progress/Progress'))
const Profile = lazy(() => import('@/pages/Profile/Profile'))

/* Admin console */
const AdminLayout = lazy(() => import('@/pages/Admin/AdminLayout'))
const AdminOverview = lazy(() => import('@/pages/Admin/Overview'))
const AdminProjects = lazy(() => import('@/pages/Admin/Projects'))
const AdminProblemStatements = lazy(() => import('@/pages/Admin/ProblemStatements'))
const AdminParticipants = lazy(() => import('@/pages/Admin/Participants'))
const AdminContributions = lazy(() => import('@/pages/Admin/Contributions'))
const AdminScoring = lazy(() => import('@/pages/Admin/Scoring'))
const AdminGithub = lazy(() => import('@/pages/Admin/Github'))
const AdminSettings = lazy(() => import('@/pages/Admin/Settings'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:projectSlug" element={<ProjectDetails />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="rules" element={<Rules />} />
              <Route path="badges" element={<Badges />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="about" element={<About />} />
              <Route path="profile/:username" element={<Profile />} />

              {/* Participant workspace */}
              <Route
                path="dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="progress"
                element={
                  <RequireAuth>
                    <Progress />
                  </RequireAuth>
                }
              />

              {/* Admin console */}
              <Route
                path="admin"
                element={
                  <RequireAuth role="admin">
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="problem-statements" element={<AdminProblemStatements />} />
                <Route path="participants" element={<AdminParticipants />} />
                <Route path="contributions" element={<AdminContributions />} />
                <Route path="leaderboard" element={<Navigate to="/leaderboard" replace />} />
                <Route path="scoring" element={<AdminScoring />} />
                <Route path="github" element={<AdminGithub />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
