import { Routes, Route } from 'react-router'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Retirement Manager
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  )
}

function Home() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Welcome to Retirement Manager
      </h2>
      <p className="text-gray-600">
        Plan your retirement with confidence.
      </p>
    </div>
  )
}

export default App
