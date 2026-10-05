import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { CommandPalette } from '@/components/search/CommandPalette'
import { PageLoader } from '@/components/layout/PageLoader'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

/** Root shell: sticky nav, routed content, footer, global search and toasts. */
export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  /** Pages that manage their own top spacing (hero or full-viewport card). */
  const selfPaddedRoutes = ['/', '/dashboard', '/progress']
  const selfPadded = selfPaddedRoutes.includes(location.pathname) || location.pathname.startsWith('/admin')

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#050B14' }}>
      <ScrollToTop />
      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      {/* Non-self-padded pages get padding-top to clear the fixed floating navbar. */}
      <main id="main" className="flex-1" style={selfPadded ? {} : { paddingTop: 'var(--content-top)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0A141F',
            border: '1px solid rgba(45,212,191,0.2)',
            color: '#FFFFFF',
            fontFamily: 'Space Mono, monospace',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}
