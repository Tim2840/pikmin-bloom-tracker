import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import PeoplePage from './pages/PeoplePage'
import RecordsPage from './pages/RecordsPage'
import StatsPage from './pages/StatsPage'

export default function App() {
  return (
    <Router>
      <div className="flex-1 pb-28 pt-6 max-w-md mx-auto w-full px-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </div>
      <Navbar />
    </Router>
  )
}
