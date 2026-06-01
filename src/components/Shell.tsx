import { site } from '@/data/site'
import MagTitle from './MagTitle'
import Ticker from './Ticker'
import NavSidebar from './NavSidebar'
import Footer from './Footer'
import NavStarField from './NavStarField'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>

      <div className="shell">

        {/* Header — full width, no logo corner */}
        <header className="shell-header">
          <MagTitle />
          <Ticker />
        </header>

        {/* Sidebar nav with star layer */}
        <div className="shell-nav">
          <NavStarField />
          <NavSidebar />
        </div>

        {/* Content */}
        <main className="shell-content">
          {children}
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </>
  )
}
