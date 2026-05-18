import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/productos'); 
        const data = await response.json();
        
        // Mapeamos el array directo que manda tu backend
        if (Array.isArray(data)) {
          setProductos(data);
        }
        setCargando(false);
      } catch (error) {
        console.error("Error cargando el catálogo:", error);
        setCargando(false);
      }
    };
    obtenerProductos();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="font-black text-2xl tracking-widest text-cyan-400 animate-pulse uppercase">
          Cargando Catálogo Urbano...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen p-8 text-white">
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Urbanó <span className="text-cyan-400">AR</span> Studio
          </h1>
          <p className="text-gray-400 font-light text-sm mt-1">
            Colección premium integrada con vestuario virtual interactivo.
          </p>
        </div>
        <span className="mt-4 md:mt-0 bg-gray-900 border border-gray-700 text-xs text-cyan-400 px-4 py-2 rounded-full font-mono">
          Items en DB: {productos.length}
        </span>
      </div>

      {/* GRILLA CONTROLADA */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {productos.map((prod) => {
          
          // CONTROL DE CALIDAD (Filtro de Fallback por si imágenes viene vacío como en el ID 1)
          const imagenPrincipal = prod.imagenes && prod.imagenes.length > 0 
            ? prod.imagenes[0].url 
            : "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=500&q=80"; // Foto urbana base de respaldo

          return (
            <div 
              key={prod.id}
              className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300 flex flex-col h-[440px]"
            >
              {/* Box de la foto */}
              <div className="relative h-64 w-full overflow-hidden bg-black">
                <img 
                  src={imagenPrincipal} 
                  alt={prod.titulo} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-black bg-opacity-70 border border-gray-700 text-gray-300 text-[10px] font-mono px-2 py-1 rounded">
                  ID: {prod.id}
                </span>
              </div>

              {/* Box de Información */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg line-clamp-1 text-white group-hover:text-cyan-400 transition-colors">
                    {prod.titulo}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 font-light mt-1">
                    {prod.descripcion}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">Precio</span>
                    <span className="text-xl font-black text-white">
                      ${Number(prod.precio).toLocaleString('es-AR')}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/producto/${prod.id}`)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Probar Prenda
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;