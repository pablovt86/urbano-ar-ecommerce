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

  // CONTROL DE SESIÓN COGNITIVA
  const [tieneEscaneoPrevio, setTieneEscaneoPrevio] = useState(false);

  // ESTADOS DE MEDIDAS
  const [alturaActual, setAlturaActual] = useState(170);
  const [pesoActual, setPesoActual] = useState(73);

  // ============================================================================
  // 1. OBTENER PRODUCTO DESDE TU CONTROLADOR NATIVO DE SEQUELIZE (MYSQL)
  // ============================================================================
  useEffect(() => {
    const obtenerDetalleProducto = async () => {
      try {
        const productoId = id || 6; 
        const response = await fetch(`http://localhost:3000/api/productos/${productoId}`);
        const data = await response.json();

        if (data) {
          setProducto(data);
          console.log("Variantes recibidas:", data.variantes);
          // 🔄 CORRECCIÓN: Buscamos la foto principal real que viene de la relación de Sequelize
          if (data.imagenes && data.imagenes.length > 0) {
            const principal = data.imagenes.find(img => img.es_principal)?.url || data.imagenes[0].url;
            setImagenCentral(principal);
          } else {
            setImagenCentral("hoodie.png");
          }

         if (data.variantes?.length > 0) {
              setMascaraVtonActual(
                data.variantes[0].imagen_vton_url
              );
            } else{
              setMascaraVtonActual('remera.png');
            }
                    }

        const perfilFrente = localStorage.getItem('urbano_user_torso_frente');
        const perfilPerfil = localStorage.getItem('urbano_user_torso_perfil');
        if (perfilFrente && perfilPerfil) {
          setTieneEscaneoPrevio(true);
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
      console.log("TALLE:", talleSeleccionado);

console.log(
  producto.variantes.map(v => ({
      talle: v.talle,
      imagen: v.imagen_vton_url
  }))
);

   const varianteExacta =
   producto.variantes?.find(
      v => v.talle === talleSeleccionado
   ) ||
   producto.variantes?.[0];
   
   
      if (varianteExacta?.imagen_vton_url) {
      setMascaraVtonActual(
      varianteExacta.imagen_vton_url
        );
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

    const alturaInyectada = datosCalculados.altura || alturaActual;
    const pesoInyectada = datosCalculados.peso || pesoActual;

    setAlturaActual(alturaInyectada);
    setPesoActual(pesoInyectada);
    
    console.log(`✨ QA SINK - Datos capturados: H=${alturaInyectada}cm, W=${pesoInyectada}kg -> Talle: ${talle}`);
  };

  const sincronizarConfigProbador = async (productoId, altura, peso) => {
    try {
      await fetch('http://localhost:3000/api/sistema/configurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: productoId,
          altura,
          peso
        })
      });
    } catch (error) {
      console.warn('No se pudo sincronizar config del probador:', error);
    }
  };

  useEffect(() => {
    if (!producto?.id) return;
    sincronizarConfigProbador(producto.id, alturaActual, pesoActual);
  }, [producto?.id, alturaActual, pesoActual]);

  // ============================================================================
  // 4. ACCIÓN DEL BOTÓN: REALIDAD AUMENTADA (CAMARA VIVO)
  // ============================================================================
  
  const abrirProbadorVirtual = async () => {
  
    try {
      await sincronizarConfigProbador(producto.id, alturaActual, pesoActual);

      const response = await fetch('http://localhost:3000/api/sistema/abrir-probador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productoId: producto.id,
          altura: alturaActual,  
          peso: pesoActual,      
          imagen: mascaraVtonActual,
          tipo_prenda: producto.tipo_prenda,
          tipo_overlay: producto.tipo_overlay
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log("⏳ Node inició Python. Esperando estabilización de hardware...");
        
        setTimeout(() => {
          setContadorCamara(Date.now()); 
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

  // ============================================================================
  // 5. ENRUTAMIENTO AL AI STUDIO
  // ============================================================================
  const viajarAlStudioEstaticoIA = () => {
    console.log("📡 Redirigiendo al Espacio de Trabajo: AI Studio Studio...");
    navigate(`/probadorAvanzado/${producto.id || id}`, {
      state: {
        productoActual: producto,
        imagenSeleccionadaVton: mascaraVtonActual,
        alturaActual,
        pesoActual,
        talleSeleccionado,
        modoDirecto: tieneEscaneoPrevio 
      }
    });
  };
  console.log("PRENDA ENVIADA:", mascaraVtonActual);

  if (cargando) return <div className="text-center p-20 font-mono text-cyan-400 bg-gray-950 min-h-screen">Sincronizando Base de Datos...</div>;
  if (!producto) return <div className="text-center p-20 text-red-500 bg-gray-950 min-h-screen">Producto no hallado en MySQL.</div>;

  // 🔄 CORRECCIÓN GALERÍA: Si no tiene imágenes asignadas, armamos un array con el hoodie de respaldo
  const galeriaImagenes = producto.imagenes && producto.imagenes.length > 0 
    ? producto.imagenes 
    : [{ id: 'default', url: 'hoodie.png' }];

  // 🔄 CORRECCIÓN URL CENTRAL: Apuntamos de forma estricta hacia tu Express local usando la foto seleccionada
  const URLImagenCentral = `http://localhost:3000/images/${imagenCentral}`;

  return (
    <div className="bg-gray-950 min-h-screen text-white p-8 relative font-mono">
      
      {/* Botón de retorno al Home */}
      <button 
        onClick={() => navigate('/')}
        className="mb-6 text-xs uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
      >
        ← Volver al Catálogo
      </button>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 overflow-hidden">
        
        {/* LADO IZQUIERDO: MINIATURAS VERTICALES + DISPLAY CENTRAL */}
        <div className="w-full md:w-1/2 flex gap-4 h-[500px]">
          
          {/* Miniaturas */}
          <div className="flex flex-col gap-3 w-20 h-full overflow-y-auto pr-1 scrollbar-none">
            {galeriaImagenes.map((img, index) => (
              <button
                key={img.id || index}
                onClick={() => setImagenCentral(img.url)}
                className={`w-full h-20 rounded-xl overflow-hidden border-2 bg-gray-900 transition-all ${
                  imagenCentral === img.url ? 'border-cyan-500 scale-95 shadow-lg' : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                {/* 🔄 CORRECCIÓN: Añadido el prefijo local del servidor Express a las miniaturas */}
                <img 
                  src={`http://localhost:3000/images/${img.url}`} 
                  alt="Muestra" 
                  className="w-full h-full object-contain" 
                />
              </button>
            ))}
          </div>

          {/* Display Grande */}
          <div className="flex-1 flex items-center justify-center bg-gray-900/50 rounded-2xl h-full overflow-hidden border border-gray-800 relative">
            <img 
              src={URLImagenCentral} 
              alt={producto.titulo}
              className="max-h-full transition-transform duration-500 ease-out object-contain"
              style={{ transform: `scale(${escala})` }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80";
              }}
            />
            
            {/* BOTÓN CLASSIC RA (CAMARA EN VIVO) */}
           
            <button 
              onClick={abrirProbadorVirtual}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-950/90 hover:bg-gray-900 text-cyan-400 border border-cyan-500/40 font-bold px-5 py-3 rounded-full text-[10px] transition-all z-10 shadow-2xl tracking-widest uppercase whitespace-nowrap"
            >
              📹 AR EN VIVO
            </button>
          </div>
        </div>

        {/* LADO DERECHO: INFO DESDE TU CONTROLADOR */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest text-cyan-400">
            Categoría: {producto.categoria?.nombre || "General"}
          </span>
          <h1 className="text-4xl font-black mb-2 mt-1 text-white uppercase tracking-tight">{producto.titulo}</h1>
          <p className="text-3xl font-light text-cyan-400 mb-6">${Number(producto.precio).toLocaleString('es-AR')}</p>
          <p className="text-gray-400 text-sm font-light mb-6 leading-relaxed">{producto.descripcion}</p>

          {/* PANEL PREMIUM IA */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold bg-purple-950/40 px-2 py-1 rounded-md border border-purple-800/30">
                ✨ ESPACIO AI STUDIO
              </span>
              <span className="text-[9px] text-gray-500">
                {tieneEscaneoPrevio ? "🟢 SESIÓN CONECTADA" : "⚪ REQUERIR CONFIGURACIÓN"}
              </span>
            </div>

            <button
              onClick={viajarAlStudioEstaticoIA}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
            >
              {tieneEscaneoPrevio ? "🔮 VER CALCE DE ALTA FIDELIDAD (NANO BANANA 2)" : "📷 ESCANEAR MI CUERPO (ASISTENTE IA)"}
            </button>
          </div>

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