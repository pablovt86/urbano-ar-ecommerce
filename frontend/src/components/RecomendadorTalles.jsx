import React, { useState } from 'react';

const RecomendadorTalles = ({ productoId, onTalleCalculado }) => {
  const [altura, setAltura] = useState('170');
  const [peso, setPeso] = useState('73');
  const [talleSugerido, setTalleSugerido] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const consultarTalleSugerido = async (e) => {
    e.preventDefault();
    if (!altura || !peso) return;

    setProcesando(true);
    try {
      // 1. Le pegamos a tu API de Node/Express para calcular el talle real en MySQL
      const response = await fetch('http://localhost:3000/api/talles/recomendar')
        .then(res => res.json())
        .catch(err => {
          console.error("Error en la consulta al backend:", err);
          throw new Error("No se pudo conectar con el servidor de recomendación.");
        });
      

      const data = await response.json();

      if (data.success && data.recomendacion) {
        const talleFinal = data.recomendacion.talle;
        setTalleSugerido(talleFinal);

        // ============================================================================
        // VÍNCULO DE QA: Mandamos las medidas tipeadas en caliente hacia el componente Padre
        // ============================================================================
        onTalleCalculado({
          talle: talleFinal,
          altura: parseInt(altura),
          peso: parseFloat(peso)
        });
      }
    } catch (error) {
      console.error("Error al calcular el talle sugerido:", error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl max-w-md">
      <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
        <span>📏</span> Asistente Inteligente de Calce
      </h3>

      <form onSubmit={consultarTalleSugerido} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {/* INPUT ALTURA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono tracking-wide text-gray-400">Altura (cm)</label>
            <input 
              type="number" 
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              placeholder="Ej: 175"
              className="bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none transition-colors"
              required
            />
          </div>

          {/* INPUT PESO */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-mono tracking-wide text-gray-400">Peso (kg)</label>
            <input 
              type="number" 
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Ej: 75"
              className="bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* BOTÓN RECOMENDAR */}
        <button
          type="submit"
          disabled={procesando}
          className="w-full bg-gray-800 hover:bg-cyan-500 hover:text-black text-cyan-400 font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all duration-200 border border-gray-700 disabled:opacity-50"
        >
          {procesando ? 'Analizando contextura...' : 'Calcular mi talle ideal'}
        </button>
      </form>

      {/* CUADRO DE RESULTADO DINÁMICO */}
      {talleSugerido && (
        <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between animate-fadeIn">
          <div>
            <p className="text-xs text-gray-400 font-light">Tu talle recomendado es:</p>
            <p className="text-xs text-cyan-500 font-mono mt-0.5">Basado en tu fisonomía</p>
          </div>
          <div className="bg-cyan-500 text-black font-black text-2xl h-12 w-12 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            {talleSugerido}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecomendadorTalles;