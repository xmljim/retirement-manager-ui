import { Routes, Route } from 'react-router'
import { AppLayout } from './components/layout'
import { Dashboard, PersonDetail, PersonForm, LimitsDisplay } from './pages'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<PersonDetail />} />
        <Route path="/profile/edit" element={<PersonForm />} />
        <Route path="/limits" element={<LimitsDisplay />} />
      </Route>
    </Routes>
  )
}
