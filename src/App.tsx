import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ClientesPage from './pages/clientes'
import ArticulosPage from './pages/articulos'
import FacturacionPage from './pages/facturacion'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/articulos" element={<ArticulosPage />} />
          <Route path="/facturacion" element={<FacturacionPage />} />
          <Route path="/" element={<Navigate to="/clientes" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
