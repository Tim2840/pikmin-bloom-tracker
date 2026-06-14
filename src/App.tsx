import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import PeoplePage from './pages/PeoplePage'
import QuickActionsPage from './pages/QuickActionsPage'
import RecordsPage from './pages/RecordsPage'
import StatsPage from './pages/StatsPage'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  return (
    <Router basename="/pikmin-bloom-tracker">
      <Navbar />
      <main className="flex-1 pb-32 pt-6 md:pb-16 md:pt-8 max-w-full md:max-w-6xl mx-auto w-full px-4 md:px-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/people/quick-actions" element={<QuickActionsPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </Router>
  )
}
