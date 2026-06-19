import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const VISIBILITY_THRESHOLD = 0.5;
const LANDMARKS_CRITICOS = [11, 12, 23, 24];

function landmarksCriticosVisibles(landmarks) {
  return LANDMARKS_CRITICOS.every(
    (idx) => (landmarks[idx].visibility ?? 1) >= VISIBILITY_THRESHOLD
  );
}

function clonarLandmarks(landmarks) {
  return landmarks.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z, visibility: pt.visibility }));
}

// ============================================================================
// 📐 FUNCIONES MATEMÁTICAS DE DEFORMACIÓN DE TELAS (Mallas por Coordenadas)
// ============================================================================
function deformarYCalzarPrenda(ctx, landmarks, imgPrenda, escalaAlto = 1) {
  if (!landmarks || landmarks.length < 25 || !imgPrenda || imgPrenda.naturalWidth === 0) return;

  const pHombroIzq = { x: landmarks[11].x * ctx.canvas.width, y: landmarks[11].y * ctx.canvas.height };
  const pHombroDer = { x: landmarks[12].x * ctx.canvas.width, y: landmarks[12].y * ctx.canvas.height };

  const anchoHombros = Math.hypot(pHombroDer.x - pHombroIzq.x, pHombroDer.y - pHombroIzq.y);
  const cuelloY = ((pHombroDer.y + pHombroIzq.y) / 2) - (anchoHombros * 0.12);

  let pCaderaIzq = { x: landmarks[23].x * ctx.canvas.width, y: landmarks[23].y * ctx.canvas.height };
  let pCaderaDer = { x: landmarks[24].x * ctx.canvas.width, y: landmarks[24].y * ctx.canvas.height };

  const caderaYMedia = (pCaderaIzq.y + pCaderaDer.y) / 2;
  const padY = (caderaYMedia - cuelloY) * (escalaAlto - 1) * 0.5;
  pCaderaIzq = { ...pCaderaIzq, y: pCaderaIzq.y + padY };
  pCaderaDer = { ...pCaderaDer, y: pCaderaDer.y + padY };

  ctx.save();
  ctx.globalAlpha = 0.97;
  ctx.filter = 'blur(0.6px)';

  dibujarTrianguloTextura(ctx, imgPrenda, 
      pHombroDer.x, cuelloY, 0, 0,
      pHombroIzq.x, cuelloY, imgPrenda.naturalWidth, 0,
      pCaderaIzq.x, pCaderaIzq.y, imgPrenda.naturalWidth, imgPrenda.naturalHeight
  );

  dibujarTrianguloTextura(ctx, imgPrenda, 
      pHombroDer.x, cuelloY, 0, 0,
      pCaderaIzq.x, pCaderaIzq.y, imgPrenda.naturalWidth, imgPrenda.naturalHeight,
      pCaderaDer.x, pCaderaDer.y, 0, imgPrenda.naturalHeight
  );

  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.restore();
}

function dibujarTrianguloTextura(ctx, im, x0, y0, u0, v0, x1, y1, u1, v1, x2, y2, u2, v2) {
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.save(); ctx.clip();
  const delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
  if (Math.abs(delta) < 0.001) { ctx.restore(); return; }
  const a = -(v0*x1 - v1*x0 - v0*x2 + v2*x0 + v1*x2 - v2*x1) / delta;
  const b = (u0*x1 - u1*x0 - u0*x2 + u2*x0 + u1*x2 - u2*x1) / delta;
  const c = (u0*v1*x2 - v0*u1*x2 - u0*v2*x1 + v0*u2*x1 + u1*v2*x0 - v1*u2*x0) / delta;
  const d = -(v0*y1 - v1*y0 - v0*y2 + v2*y0 + v1*y2 - v2*y1) / delta;
  const e = (u0*y1 - u1*y0 - u0*y2 + u2*y0 + u1*y2 - u2*y1) / delta;
  const f = (u0*v1*y2 - v0*u1*y2 - u0*v2*y1 + v0*u2*y1 + u1*v2*y0 - v1*u2*y0) / delta;
  ctx.transform(a, d, b, e, c, f); ctx.drawImage(im, 0, 0); ctx.restore();
}

// ============================================================================
// 🚀 COMPONENTE PRINCIPAL DE REACT (Exportado por Default)
// ============================================================================
export default function ProbadorAvanzado({ urlPrendaDesdeCatalogo }) {
  const { id: productoIdParam } = useParams();
  const location = useLocation();

  const [pasoGeneral, setPasoGeneral] = useState(1);
  const [estadoIA, setEstadoIA] = useState("⏳ Cargando mallas corporales de MediaPipe Pose...");
  const [modeloListo, setModeloListo] = useState(false);
  const [procesandoEnvio, setProcesandoEnvio] = useState(false);
  const [imagenFusionada, setImagenFusionada] = useState(null);
  const [camaraPrendida, setCamaraPrendida] = useState(false);
  const [escalaAlto, setEscalaAlto] = useState(1);

  const videoRef = useRef(null); 
  const canvasRef = useRef(null); 
  const poseRef = useRef(null); 
  const streamGlobalRef = useRef(null); 
  const imagePrendaRef = useRef(null);
  const ultimosLandmarksValidos = useRef(null);



useEffect(() => {
    console.log("==================================================");
    console.log("🚨 [Auditoría Probador] ¿Qué nos mandó el Catálogo?");
    console.log("🔗 Prop 'urlPrendaDesdeCatalogo':", urlPrendaDesdeCatalogo);
    console.log("==================================================");
  }, [urlPrendaDesdeCatalogo]);



  // Si no llega url por props de la tienda, metemos tu link de ngrok para asegurar compatibilidad directa
// Desarmamos la URL de ngrok y la convertimos a Localhost directo para evitar el CORS de red externa
const obtenerUrlLocal = (urlOriginal) => {
  if (!urlOriginal) return "http://localhost:3000/images/hoodie.png";
  // Si la URL viene con ngrok, le cambiamos el dominio por el puerto local de tu backend
  if (urlOriginal.includes("ngrok-free.dev")) {
    const pedazoCarpeta = urlOriginal.split(".ngrok-free.dev")[1]; // Se queda con /images/coat.png
    return `http://localhost:3000${pedazoCarpeta}`; // Arma http://localhost:3000/images/coat.png
  }
  return urlOriginal;
};

const urlPrendaReal = obtenerUrlLocal(
  urlPrendaDesdeCatalogo || location.state?.imagenSeleccionadaVton
);

  const ESCALAS_ALTO = { S: 0.95, M: 1, L: 1.06, XL: 1.12, XXL: 1.18 };

  useEffect(() => {
    const productoId = productoIdParam || location.state?.productoActual?.id;
    const altura = location.state?.alturaActual ?? 170;
    const peso = location.state?.pesoActual ?? 70;
    const talle = location.state?.talleSeleccionado ?? 'M';

    setEscalaAlto(ESCALAS_ALTO[talle] || 1);

    if (!productoId) return;

    fetch('http://localhost:3000/api/sistema/configurar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id: Number(productoId), altura, peso })
    }).catch((err) => console.warn('Config probador:', err));
  }, [productoIdParam, location.state]);
  // ============================================================================
  // 📥 EFECTO 1: CONFIGURAR MEDIAPIPE POSE ENGINE
  // ============================================================================
  useEffect(() => {
    const inicializarPose = () => {
      try {
        if (!window.Pose) {
          setEstadoIA("❌ Error: No se encontró la librería Pose en window.");
          return;
        }

        const poseEngine = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        poseEngine.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        poseEngine.onResults((results) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 1. Pintamos el stream de tu cámara real en el fondo
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          
          // 2. Si la IA detecta tu cuerpo, deforma el abrigo arriba de tu torso
          if (results.poseLandmarks) {
            const imgElement = imagePrendaRef.current;
            let landmarksActivos = results.poseLandmarks;

            if (landmarksCriticosVisibles(results.poseLandmarks)) {
              ultimosLandmarksValidos.current = clonarLandmarks(results.poseLandmarks);
            } else if (ultimosLandmarksValidos.current) {
              landmarksActivos = ultimosLandmarksValidos.current;
            }

            if (imgElement && imgElement.complete && imgElement.naturalWidth > 0 && landmarksActivos) {
              deformarYCalzarPrenda(ctx, landmarksActivos, imgElement, escalaAlto);
            }

            ctx.fillStyle = '#00ffff';
            LANDMARKS_CRITICOS.forEach(index => {
              const pt = landmarksActivos[index];
              if (!pt) return;
              ctx.beginPath();
              ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 6, 0, 2 * Math.PI);
              ctx.fill();
            });
          }
        });

        poseRef.current = poseEngine;
        setModeloListo(true);
        setEstadoIA("✅ IA Mallas Corporales Lista");
        console.log("🤖 [MediaPipe] Motor Pose inicializado con éxito.");
      } catch (err) {
        console.error("Error inicializando Pose:", err);
        setEstadoIA(`❌ Error configurando Mallas: ${err.message}`);
      }
    };

    if (window.Pose) {
      inicializarPose();
    } else {
      console.log("📦 Descargando scripts de mallas corporales Pose...");
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
      script.async = true;
      script.onload = () => {
        console.log("📦 Script Pose descargado con éxito.");
        inicializarPose();
      };
      script.onerror = () => setEstadoIA("❌ Error crítico al descargar archivos de mallas.");
      document.body.appendChild(script);
    }
  }, []);

  // ============================================================================
  // 📹 EFECTO 2: CONTROL SEGURO DE HARDWARE CÁMARA
  // ============================================================================
  useEffect(() => {
    if (pasoGeneral !== 1) {
      apagarHardwareCamara();
      return;
    }

    if (camaraPrendida) return;

    const encenderCamara = async () => {
      try {
        console.log("📹 [Hardware] Encendiendo lente...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        streamGlobalRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCamaraPrendida(true);
          console.log("✅ [Hardware] Video activo.");
        }
      } catch (err) {
        console.error("❌ Error al encender la cámara:", err);
        setEstadoIA(`❌ Error de Cámara: ${err.message}`);
        setCamaraPrendida(false);
      }
    };

    const timeoutId = setTimeout(() => { encenderCamara(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [pasoGeneral, camaraPrendida]);

  const apagarHardwareCamara = () => {
    if (streamGlobalRef.current) {
      console.log("🔒 [Corte de Energía] Apagando tracks...");
      streamGlobalRef.current.getTracks().forEach(track => track.stop());
      streamGlobalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCamaraPrendida(false);
  };

  // ============================================================================
  // 🕒 EFECTO 3: BUCLE ENVIADOR DE FRAMES
  // ============================================================================
  useEffect(() => {
    if (!modeloListo || pasoGeneral !== 1) return;

    let procesandoFrame = false;

    const intervalVideo = setInterval(async () => {
      const video = videoRef.current;
      
      if (video && poseRef.current && video.readyState === 4) {
        if (video.paused) {
          video.play().catch(() => {});
          return;
        }

        if (procesandoFrame) return;

        try {
          procesandoFrame = true;
          await poseRef.current.send({ image: video });
        } catch (e) {
          console.error("Error mandando frame a Pose:", e);
        } finally {
          procesandoFrame = false;
        }
      }
    }, 70); // Refresco ultra fluido de mallas

    return () => clearInterval(intervalVideo);
  }, [modeloListo, pasoGeneral]);

  // ============================================================================
  // 🚀 FUNCIÓN DE ENVÍO AL BACKEND PUENTE
  // ============================================================================
  const manejarEnvioServidor = async () => {
    const canvas = canvasRef.current;
    if (!canvas || procesandoEnvio) return;

    try {
      setProcesandoEnvio(true);
      // Extrae el screenshot del canvas con el buzo ya deformado en tus hombros
      const fotoConBuzoBase64 = canvas.toDataURL('image/jpeg');

      const respuesta = await fetch('http://localhost:3000/api/sistema/procesar-vestidor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foto_usuario_base64: fotoConBuzoBase64,
          url_prenda_catalogo: urlPrendaReal,
          producto_id: Number(productoIdParam || location.state?.productoActual?.id) || null
        })
      });

      const datos = await respuesta.json();

      if (datos.success) {
        setImagenFusionada(datos.imagen_fusionada);
        setPasoGeneral(2);
      } else {
        alert(`Error: ${datos.error}`);
        apagarHardwareCamara();
        setPasoGeneral(0);
      }
    } catch (error) {
      console.error("❌ Falló el envío:", error);
      alert("Error crítico de red con tu servidor Node.");
      apagarHardwareCamara();
      setPasoGeneral(0);
    } finally {
      setProcesandoEnvio(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h2>👕 Probador Virtual de Mallas Inteligentes</h2>
      
      <p style={{ fontWeight: 'bold', color: modeloListo ? 'green' : '#00bfff' }}>
        {estadoIA}
      </p>

      {/* --- PANTALLA 0: REPOSO --- */}
      {pasoGeneral === 0 && (
        <div style={{ padding: '30px', border: '1px dashed #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
          <p>🛑 El sistema está en reposo.</p>
          <button onClick={() => setPasoGeneral(1)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            📸 Volver a encender cámara
          </button>
        </div>
      )}

      {/* --- PANTALLA 1: CÁMARA --- */}
      {pasoGeneral === 1 && (
        <div>
          <video ref={videoRef} muted playsInline autoPlay style={{ display: 'none' }} />

          {/* Imagen oculta del catálogo que usa la función matemática */}
          <img 
            ref={imagePrendaRef} 
            src={urlPrendaReal} 
            crossOrigin="anonymous" // Evita problemas de CORS en el Canvas
            style={{ display: 'none' }} 
            onLoad={() => console.log("👕 Prenda cargada en caché y lista para deformarse!")}
            onError={() => console.error("❌ Error de CORS o Ruta: La imagen no pudo bajarse.")}
            alt="catálogo" 
          />

          <div style={{ position: 'relative', display: 'inline-block', background: '#000', borderRadius: '8px' }}>
            <canvas ref={canvasRef} width="640" height="480" style={{ borderRadius: '8px' }} />
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={manejarEnvioServidor}
              disabled={!modeloListo || procesandoEnvio}
              style={{ 
                padding: '12px 24px', 
                fontSize: '16px', 
                cursor: (!modeloListo || procesandoEnvio) ? 'not-allowed' : 'pointer', 
                backgroundColor: (!modeloListo || procesandoEnvio) ? '#aaa' : '#00bfff', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '5px' 
              }}
            >
              {procesandoEnvio ? "Estructurando calce..." : "📸 Capturar y Probar"}
            </button>
            <button
              onClick={() => { apagarHardwareCamara(); setPasoGeneral(0); }}
              disabled={procesandoEnvio}
              style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              ❌ Apagar Cámara
            </button>
          </div>
        </div>
      )}

      {/* --- PANTALLA 2: RESULTADO FINAL --- */}
      {pasoGeneral === 2 && (
        <div style={{ marginTop: '20px' }}>
          <h3>✨ ¡Tu outfit de mallas reales está listo!</h3>
          <div style={{ margin: '15px 0' }}>
            <img src={imagenFusionada} alt="Resultado" style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '8px' }} />
          </div>
          <button onClick={() => setPasoGeneral(1)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            🔄 Probar otra vez
          </button>
        </div>
      )}
    </div>
  );
}