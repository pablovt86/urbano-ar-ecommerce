import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DetalleProducto from './pages/DetalleProducto';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz: Muestra el catálogo completo */}
        <Route path="/" element={<Home />} />
        
        {/* Ruta del detalle: El ":id" es capturado por useParams() en DetalleProducto */}
        <Route path="/producto/:id" element={<DetalleProducto />} />
      </Routes>
    </Router>
  );
}

export default App;