// src/pages/ProbadorAvanzado.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';

const ProbadorAvanzado = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { productoActual, imagenSeleccionadaVton, modoDirecto } = location.state || {};

  // Referencias de Hardware
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const segmentationRef = useRef(null);

  // Estados de la Máquina de Estados
  const [pasoGeneral, setPasoGeneral] = useState(modoDirecto ? 3 : 1); // 1: Escaneo, 2: Procesando, 3: Visor
  const [etapaEscaneo, setEtapaEscaneo] = useState('frente'); 
  const [modeloListo, setModeloListo] = useState(false);
  const [cargandoIA, setCargandoIA] = useState(false);

  // Sistema de Automatismo manos libres
  const [contadorAutofoto, setContadorAutofoto] = useState(null);
  const [cuerpoDetectadoYCalibrado, setCuerpoDetectadoYCalibrado] = useState(false);
  
  // Guardamos los contadores en referencias estables para evitar duplicación de hilos
  const intervalIdRef = useRef(null);
  const cuentaRegresivaRef = useRef(3);

  // Galería de Perfiles del Usuario
  const [galeriaIA, setGaleriaIA] = useState([]);
  const [imagenCentralIA, setImagenCentralIA] = useState('');

  // ============================================================================
  // 1. INCORPORACIÓN DINÁMICA DE MEDIAPIPE Y CONTROL DE MONTAJE
  // ============================================================================
  useEffect(() => {
    const inicializarMotoresVision = async () => {
      try {
        await tf.ready();

        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          if (!window.SelfieSegmentation) return;

          const segmentator = new window.SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
          });

          segmentator.setOptions({ modelSelection: 1 }); 
          segmentator.onResults(onSegmentacionResults);
          segmentationRef.current = segmentator;
          setModeloListo(true);

          if (modoDirecto) {
            armarGaleriaConFotosRealesDelUsuario();
          } else {
            await encenderWebcamNativa();
          }
        };
      } catch (err) {
        console.error("❌ Error en módulo de visión:", err);
      }
    };

    inicializarMotoresVision();

    return () => {
      limpiarTemporizadores();
      laCerrarCamaraFisica();
    };
  }, [id, modoDirecto]);

  const limpiarTemporizadores = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setContadorAutofoto(null);
  };

  // ============================================================================
  // 2. INTERFACES DE CONEXIÓN DE HARDWARE
  // ============================================================================
  const encenderWebcamNativa = async () => {
    try {
      if (streamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.warn("⚠️ Error accediendo a la cámara:", err.message);
    }
  };

  const laCerrarCamaraFisica = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (segmentationRef.current) {
      try { segmentationRef.current.close(); } catch(e){}
    }
  };

  // Callback del motor de segmentación
  const onSegmentacionResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas || pasoGeneral !== 1) return;
    
    // FIX DE RENDIMIENTO: Agregamos 'willReadFrequently' para optimizar la lectura de píxeles
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // ANALIZADOR DE PRESENCIA: Comprobamos si hay masa corporal en el centro
    const mascaraPixeles = ctx.getImageData(270, 190, 100, 100);
    let pixelesActivos = 0;
    for (let i = 3; i < mascaraPixeles.data.length; i += 4) {
      if (mascaraPixeles.data[i] > 10) pixelesActivos++;
    }

    // Si estás bien posicionado, le avisamos al sistema
    if (pixelesActivos > 500) {
      setCuerpoDetectadoYCalibrado(true);
    } else {
      setCuerpoDetectadoYCalibrado(false);
    }

    ctx.restore();
  };

  // FIX DE RENDIMIENTO CRÍTICO: Reemplazamos requestAnimationFrame por un loop controlado por tiempo
  useEffect(() => {
    if (!modeloListo || pasoGeneral !== 1) return;

    const intervalVideo = setInterval(async () => {
      if (videoRef.current && segmentationRef.current && videoRef.current.readyState === 4) {
        try {
          await segmentationRef.current.send({ image: videoRef.current });
        } catch (e) {}
      }
    }, 150); // Procesa a ~7 frames por segundo para liberar la CPU por completo

    return () => clearInterval(intervalVideo);
  }, [modeloListo, pasoGeneral]);

  // ============================================================================
  // 3. CONTROLADOR DE CUENTA REGRESIVA Y ENRUTAMIENTO AUTOMÁTICO
  // ============================================================================
  useEffect(() => {
    if (pasoGeneral !== 1) return;

    if (cuerpoDetectadoYCalibrado) {
      // Si el sensor te detecta y no hay contador activo, iniciamos la cuenta regresiva real
      if (!intervalIdRef.current) {
        cuentaRegresivaRef.current = 3;
        setContadorAutofoto(3);

        intervalIdRef.current = setInterval(() => {
          cuentaRegresivaRef.current -= 1;
          
          if (cuentaRegresivaRef.current <= 0) {
            limpiarTemporizadores();
            dispararFotoAutomatica(); // Toma la foto sola al llegar a 0
          } else {
            setContadorAutofoto(cuentaRegresivaRef.current);
          }
        }, 1000);
      }
    } else {
      // Si te movés de la guía, cancelamos de golpe para evitar fotos fantasma
      limpiarTemporizadores();
    }

    return () => { if (intervalIdRef.current) clearInterval(intervalIdRef.current); };
  }, [cuerpoDetectadoYCalibrado, pasoGeneral, etapaEscaneo]);

  const dispararFotoAutomatica = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fotoTomadaBase64 = canvas.toDataURL('image/png');

    if (etapaEscaneo === 'frente') {
      localStorage.setItem('urbano_user_torso_frente', fotoTomadaBase64);
      console.log("📸 Frente guardado con éxito. Preparando perfil...");
      setEtapaEscaneo('perfil');
    } 
    else if (etapaEscaneo === 'perfil') {
      localStorage.setItem('urbano_user_torso_perfil', fotoTomadaBase64);
      console.log("📸 Perfil guardado con éxito. Redirigiendo al Studio...");
      
      setPasoGeneral(2); // Pasamos a la pantalla de carga generativa
      laCerrarCamaraFisica(); // Apagamos la cámara de raíz

      setTimeout(() => {
        armarGaleriaConFotosRealesDelUsuario();
      }, 1500);
    }
  };

  // ============================================================================
  // 4. MONTAJE DE GALERÍA REAL CON TU CARA Y CUERPO
  // ============================================================================
  const armarGaleriaConFotosRealesDelUsuario = () => {
    setCargandoIA(true);

    const frenteReal = localStorage.getItem('urbano_user_torso_frente');
    const perfilReal = localStorage.getItem('urbano_user_torso_perfil');

    const setPoses = [
      { id: 'frente', titulo: 'Vista de Frente', fotoCuerpo: frenteReal },
      { id: 'perfil', titulo: 'Vista de Perfil', fotoCuerpo: perfilReal || frenteReal }
    ];

    setGaleriaIA(setPoses);
    setImagenCentralIA(setPoses[0].fotoCuerpo); // Clava tu foto real en el visor gigante
    setCargandoIA(false);
    setPasoGeneral(3); // Renderiza la Suite interactiva final
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white p-6 lg:p-12 font-mono antialiased">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-gray-900 pb-4">
        <div>
          <button onClick={() => { laCerrarCamaraFisica(); navigate(-1); }} className="text-[10px] uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors mb-1 block">
            ← Volver al Catálogo
          </button>
          <h1 className="text-lg font-black uppercase tracking-wider">Urbanó AI Fitting Studio</h1>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${modeloListo ? 'bg-purple-500 shadow-md shadow-purple-500/50' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
            {modeloListo ? "PROCESADOR OPTIMIZADO: OK" : "Iniciando Red Neuronal..."}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* PANEL DE PROCESAMIENTO */}
        <div className="flex-grow bg-gray-900/30 border border-gray-900 rounded-3xl p-6 flex items-center justify-center min-h-[500px] relative overflow-hidden">
          
          {/* PASO 1: ESCANEO MANOS LIBRES AUTOMÁTICO */}
          {pasoGeneral === 1 && (
            <div className="w-full max-w-xl flex flex-col items-center">
              <div className="w-full aspect-[4/3] rounded-2xl border border-purple-500/30 overflow-hidden bg-gray-950 shadow-2xl relative">
                <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover scale-x-[-1] bg-gray-950" />
                
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none">
                  <div className="flex justify-between items-center">
                    <span className="bg-purple-600 text-white font-bold text-[8px] uppercase tracking-widest px-3 py-1 rounded-full">ESCÁNER AUTOMÁTICO IA</span>
                    <span className="text-gray-400 text-[10px] uppercase">{etapaEscaneo === 'frente' ? "Paso 1: Frente" : "Paso 2: Perfil"}</span>
                  </div>
                  
                  {/* Retículo de Guía Dinámico */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`border-4 border-dashed rounded-full transition-all duration-300 flex items-center justify-center ${
                      cuerpoDetectadoYCalibrado ? 'w-[52%] h-[87%] border-emerald-400 bg-emerald-500/5' : 'w-[45%] h-[80%] border-purple-500/30'
                    }`}>
                      {contadorAutofoto && (
                        <div className="text-7xl font-black text-emerald-400 font-mono animate-bounce">
                          {contadorAutofoto}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`border p-3 rounded-xl text-center transition-all duration-300 ${
                    cuerpoDetectadoYCalibrado ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400' : 'bg-black/90 border-gray-800 text-gray-300'
                  }`}>
                    <p className="text-[11px] uppercase tracking-wide font-bold">
                      {contadorAutofoto 
                        ? `¡Excelente! Mantené la posición. Capturando en ${contadorAutofoto}...`
                        : etapaEscaneo === 'frente' 
                          ? "Parate de frente acomodando tu rostro y torso adentro de la guía." 
                          : "Girá 90 grados y alineá tu perfil adentro del círculo."}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={dispararFotoAutomatica} className="mt-4 text-[9px] uppercase tracking-widest text-gray-600 hover:text-purple-400 transition-colors font-bold">
                ⚙️ Forzar captura manual en caliente
              </button>
            </div>
          )}

          {/* PASO 2: PROCESAMIENTO */}
          {pasoGeneral === 2 && (
            <div className="text-center max-w-sm p-8">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Cargando tu Perfil Corporal</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">Conectando tus capturas de frente y perfil con el espejo virtual de Urbanó.</p>
            </div>
          )}

          {/* PASO 3: ESTUDIO DE INTEGRACIÓN DEFINITIVO (TU CARA Y CUERPO REALES) */}
          {pasoGeneral === 3 && imagenCentralIA && (
            <div className="w-full flex gap-6 flex-col md:flex-row-reverse items-center justify-center animate-fadeIn">
              
              {/* Contenedor Espejo Central */}
              <div className="flex-1 max-w-md aspect-[3/4] bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute top-4 left-4 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20">
                  ⚡ URBANÓ FITTING ENGINE
                </div>

                {/* Capa 1: Tu cuerpo real con tu rostro real e iluminación nativa */}
                <img src={imagenCentralIA} alt="Tu Silueta Real" className="w-full h-full object-cover z-0 absolute animate-fadeIn" />

                {/* Capa 2: La prenda del catálogo perfectamente encuadrada arriba tuyo */}
                <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none mix-blend-overlay" />
                <img 
                  src={productoActual?.imagenes?.[0]?.url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"} 
                  alt="Prenda Catálogo" 
                  className="w-[83%] h-auto object-contain z-10 mt-16 drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] mix-blend-multiply"
                />
              </div>

              {/* Carrusel del Usuario a un Costado */}
              <div className="flex md:flex-col gap-3 max-h-[450px]">
                {galeriaIA.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setImagenCentralIA(item.fotoCuerpo)} 
                    className={`w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden border-2 bg-gray-950 flex-shrink-0 transition-all duration-200 relative ${
                      imagenCentralIA === item.fotoCuerpo ? 'border-purple-500 scale-95 shadow-xl' : 'border-gray-800 opacity-40'
                    }`}
                  >
                    <img src={item.fotoCuerpo} alt={item.titulo} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* DETALLES DE LA PRENDA */}
        <div className="w-full lg:w-72 bg-gray-900/40 border border-gray-900 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-purple-400">Prenda en simulación</span>
            <h2 className="text-md font-black uppercase text-white tracking-tight mt-1 truncate">{productoActual?.titulo || "REMERA URBAN ST."}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">${Number(productoActual?.precio || 28773).toLocaleString('es-AR')}</p>
            <div className="border-t border-gray-900 my-4 pt-4">
              <p className="text-[10px] text-gray-400 leading-relaxed font-sans">{productoActual?.descripcion || "Mapeado estructural completo finalizado."}</p>
            </div>
          </div>
          
          {pasoGeneral === 3 && (
            <button 
              onClick={async () => {
                localStorage.removeItem('urbano_user_torso_frente');
                localStorage.removeItem('urbano_user_torso_perfil');
                setPasoGeneral(1);
                setEtapaEscaneo('frente');
                limpiarTemporizadores();
                await encenderWebcamNativa();
              }}
              className="w-full mt-4 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 text-red-400 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all"
            >
              🔄 Re-Calibrar Escáner
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProbadorAvanzado;