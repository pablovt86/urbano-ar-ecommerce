import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecomendadorTalles from '../components/RecomendadorTalles';

const escalasTalles = {
  'S': 0.92, 'M': 1, 'L': 1.08, 'XL': 1.16
};

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [escala, setEscala] = useState(1);
  const [talleSeleccionado, setTalleSeleccionado] = useState('M');
  const [probadorActivo, setProbadorActivo] = useState(false);
  const [contadorCamara, setContadorCamara] = useState(0);
  
  const [imagenCentral, setImagenCentral] = useState('');
  const [mascaraVtonActual, setMascaraVtonActual] = useState('remera.png');

  // ESTADOS DE MEDIDAS: Vinculados directamente a los inputs reales del Recomendador
  const [alturaActual, setAlturaActual] = useState(170);
  const [pesoActual, setPesoActual] = useState(73);

  // ============================================================================
  // 1. OBTENER PRODUCTO DESDE TU CONTROLADOR NATIVO DE SEQUELIZE (MYSQL)
  // ============================================================================
  useEffect(() => {
    const obtenerDetalleProducto = async () => {
      try {
        const productoId = id || 6; // Fallback estratégico al ID 6 por si entrás directo
        const response = await fetch(`http://localhost:3000/api/productos/${productoId}`);
        const data = await response.json();

        if (data) {
          setProducto(data);
          
          // Seteamos la imagen inicial de la tabla ImagenProducto (Unsplash)
          if (data.imagenes && data.imagenes.length > 0) {
            setImagenCentral(data.imagenes[0].url);
          } else {
            setImagenCentral("https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80");
          }

          // Cargamos la máscara inicial asociada al talle base M
          const varianteInicial = data.variantes?.find(v => v.talle === 'M');
          setMascaraVtonActual(varianteInicial?.imagen_vton_url || 'remera.png');
        }
        setCargando(false);
      } catch (error) {
        console.error("❌ Error cargando el detalle desde Express:", error);
        setCargando(false);
      }
    };

    obtenerDetalleProducto();
  }, [id]);

  // ============================================================================
  // 2. ESCUCHA DE CONTROL: SINCRONIZA LA PRENDA SELECCIONADA Y EL TALLE
  // ============================================================================
  useEffect(() => {
    if (!producto) return;

    const urlBuscar = imagenCentral || (producto.imagenes?.[0]?.url);
    const imagenActiva = producto.imagenes?.find(img => img.url === urlBuscar) || producto.imagenes?.[0];
    
    if (imagenActiva) {
      const varianteExacta = producto.variantes?.find(v => v.talle === talleSeleccionado);
      
      if (varianteExacta && varianteExacta.imagen_vton_url) {
        setMascaraVtonActual(varianteExacta.imagen_vton_url);
      }
    }
  }, [imagenCentral, talleSeleccionado, producto]);

  // ============================================================================
  // 3. CAPTURA DEL HIJO: Setea talle, altura y peso reales de tus inputs
  // ============================================================================
  const handleTalleRecomendado = (datosCalculados) => {
    const talle = datosCalculados.talle || datosCalculados;
    
    setTalleSeleccionado(talle);
    setEscala(escalasTalles[talle] || 1);

    // Salvamos las medidas inyectadas por el input para evitar el delay asincrónico
    const alturaInyectada = datosCalculados.altura || alturaActual;
    const pesoInyectada = datosCalculados.peso || pesoActual;

    setAlturaActual(alturaInyectada);
    setPesoActual(pesoInyectada);
    
    console.log(`✨ QA SINK - Datos capturados: H=${alturaInyectada}cm, W=${pesoInyectada}kg -> Talle: ${talle}`);
  };

  // ============================================================================
  // 4. ACCIÓN DEL BOTÓN: ENVÍA LA IMAGEN DEL CENTRO Y LAS MEDIDAS REALES
  // ============================================================================
  const abrirProbadorVirtual = async () => {
    try {
      console.log(`🚀 Solicitando apertura AR -> H: ${alturaActual} | W: ${pesoActual}`);

      // 1. Le avisamos a Node que levante el proceso de Python
      const response = await fetch('http://localhost:3000/api/sistema/abrir-probador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          altura: alturaActual,  
          peso: pesoActual,      
          imagen: imagenCentral // Mandamos la URL en vivo que está en el centro
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log("⏳ Node inició Python. Esperando estabilización de hardware...");
        
        // 2. PARCHE DE CONTROL: Le damos 800ms a la webcam para que inicialice 
        // antes de mostrar la etiqueta <img> y evitar que React cachee una imagen rota
        setTimeout(() => {
          setContadorCamara(Date.now()); // Timestamp único e infalible
          setProbadorActivo(true);
          console.log("📷 Espejo virtual acoplado al Front con éxito.");
        }, 800);
      }
    } catch (error) {
      console.error("Error al conectar con el backend del probador:", error);
    }
  };

  const apagarProbadorVirtual = async () => {
    setProbadorActivo(false);
    try {
      await fetch('http://localhost:5000/apagar');
    } catch (error) {
      console.error("Modo stand-by enviado con éxito.");
    }
  };

  // Renders de carga y control
  if (cargando) return <div className="text-center p-20 font-mono text-cyan-400 bg-gray-950 min-h-screen">Sincronizando Base de Datos...</div>;
  if (!producto) return <div className="text-center p-20 text-red-500 bg-gray-950 min-h-screen">Producto no hallado en MySQL.</div>;

  // Si no tiene imágenes, armamos un array con el fallback por defecto
  const galeriaImagenes = producto.imagenes && producto.imagenes.length > 0 
    ? producto.imagenes 
    : [{ id: 'default', url: imagenCentral }];

  return (
    <div className="bg-gray-950 min-h-screen text-white p-8 relative">
      
      {/* Botón de retorno al Home */}
      <button 
        onClick={() => navigate('/')}
        className="mb-6 text-xs uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors font-mono flex items-center gap-2"
      >
        ← Volver al Catálogo
      </button>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 overflow-hidden">
        
        {/* LADO IZQUIERDO: MINIATURAS VERTICALES + DISPLAY CENTRAL */}
        <div className="w-full md:w-1/2 flex gap-4 h-[500px]">
          
          {/* Carrusel de miniaturas reales de Unsplash */}
          <div className="flex flex-col gap-3 w-20 h-full overflow-y-auto pr-1 scrollbar-none">
            {galeriaImagenes.map((img, index) => (
              <button
                key={img.id || index}
                onClick={() => setImagenCentral(img.url)}
                className={`w-full h-20 rounded-xl overflow-hidden border-2 bg-gray-900 transition-all ${
                  imagenCentral === img.url ? 'border-cyan-500 scale-95 shadow-lg' : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <img src={img.url} alt="Muestra" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Visualizador central */}
          <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-2xl h-full overflow-hidden border border-gray-800 relative">
            <img 
              src={imagenCentral} 
              alt={producto.titulo}
              className="max-h-full transition-transform duration-500 ease-out object-cover"
              style={{ transform: `scale(${escala})` }} 
            />
            
            <button 
              onClick={abrirProbadorVirtual}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-cyan-500 hover:bg-cyan-600 text-black font-black px-6 py-3 rounded-full text-xs transition-all z-10 shadow-2xl tracking-wider uppercase whitespace-nowrap"
            >
              📷 Probar en Espejo Virtual
            </button>
          </div>
        </div>

        {/* LADO DERECHO: INFO DESDE TU CONTROLADOR */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Categoría: {producto.categoria?.nombre || "General"}
          </span>
          <h1 className="text-4xl font-black mb-2 mt-1 text-white uppercase tracking-tight">{producto.titulo}</h1>
          <p className="text-3xl font-light text-cyan-400 mb-6">${Number(producto.precio).toLocaleString('es-AR')}</p>
          <p className="text-gray-400 text-sm font-light mb-8 leading-relaxed">{producto.descripcion}</p>

          {/* Tu componente hijo RecomendadorTalles */}
          <RecomendadorTalles 
            productoId={producto.id} 
            onTalleCalculado={handleTalleRecomendado} 
          />
        </div>
      </div>

      {/* MODAL ESPEJO DE REALIDAD AUMENTADA */}
      {probadorActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-gray-900 rounded-3xl overflow-hidden border-4 border-cyan-500 shadow-2xl flex flex-col items-center">
            
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-cyan-400 px-4 py-2 rounded-full font-bold text-xs tracking-wider border border-cyan-500">
              URBANÓ AR FITTING SYSTEM
            </div>

            <button 
              onClick={apagarProbadorVirtual}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-6 py-2 rounded-full z-50 transition-all uppercase tracking-wider"
            >
              Cerrar Probador ×
            </button>

            <img 
              src={`http://localhost:5000/video_feed?v=${contadorCamara}`} 
              alt="Espejo Virtual Urbano" 
              className="w-full h-[75vh] object-cover bg-black"
              onError={(e) => {
                e.target.src = "https://placehold.co/800x600/0f172a/22d3ee?text=Sincronizando+Remera+Elegida...";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleProducto;