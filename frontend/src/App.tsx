import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DemoPage } from './pages/DemoPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { Callback } from './pages/Callback'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* OAuth2 callback route - handles authorization code */}
        <Route path="/callback" element={<Callback />} />
        
        {/* Protected demo page - requires authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DemoPage />
            </ProtectedRoute>
          }
        />
        
        {/* Employees page - requires authentication */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
