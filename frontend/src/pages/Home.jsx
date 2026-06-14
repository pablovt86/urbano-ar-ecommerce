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
        console.log("Productos obtenidos del backend:", data); // Log para verificar la estructura de datos
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
  // 1. Buscamos la imagen dentro del array que Sequelize asocia mediante "as: 'imagenes'"
  const imagenRelacional = prod.imagenes && prod.imagenes.length > 0 
    ? prod.imagenes.find(img => img.es_principal)?.url || prod.imagenes[0].url
    : null;

  // 2. Si existe el archivo en la base de datos armamos la ruta, si no usamos el default
  const imagenPrincipal = imagenRelacional
    ? `http://localhost:3000/images/${imagenRelacional}`
    : "http://localhost:3000/images/hoodie.png"; // Fallback consistente con tus archivos

          return (
            <div 
              key={prod.id}
              className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300 flex flex-col h-[440px]"
            >
              {/* Box de la foto */}
               <div className="relative h-64 w-full overflow-hidden bg-gray-900/50 flex items-center justify-center p-4">
      <img 
            src={imagenPrincipal} 
            alt={prod.titulo} 
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // 🔥 TRUCO ANTI-BUCLE: Desactivamos el listener inmediatamente para que no vuelva a ejecutarse
              e.target.onerror = null; 
              
              // Fallback externo de internet. Si tu servidor local muere, esto NO genera bucle
              e.target.src = "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=500&q=80"; 
              
              console.warn(`⚠️ No se pudo conectar con el servidor de imágenes local para: ${prod.titulo}`);
            }}
          />
        {/* Etiqueta de la categoría para probar pantalones en el futuro */}
        <span className="absolute top-3 left-3 bg-cyan-950/80 border border-cyan-700 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded">
          {prod.categoria?.nombre || 'General'}
        </span>
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