import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DetalleProducto from './pages/DetalleProducto';
import ProbadorAvanzado from './pages/ProbadorAvanzado';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz: Muestra el catálogo completo */}
        <Route path="/" element={<Home />} />
        
        {/* Ruta del detalle: El ":id" es capturado por useParams() en DetalleProducto */}
        <Route path="/producto/:id" element={<DetalleProducto />} />

        {/* Ruta del probador avanzado: Recibe el ID del producto para cargar su modelo 3D */}
         <Route path="/probadorAvanzado/:id" element={<ProbadorAvanzado />} /> 
      </Routes>
    </Router>
  );
}

export default App;