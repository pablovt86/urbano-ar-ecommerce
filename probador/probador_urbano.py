# ============================================================================
# PROBADOR VIRTUAL URBANÓ - EJECUCIÓN AUTÓNOMA POR DEMANDA
# ============================================================================

import cv2
import mediapipe as mp
import time
import numpy as np
import json
import os
import threading
import speech_recognition as sr
import sys
import requests 
import urllib.request
from flask import Flask, Response, request, jsonify
from flask_cors import CORS

# ============================================================================
# 1. CAPTURA DE ARGUMENTOS ENVIADOS POR NODE.JS (MUESTRA REAL)
# ============================================================================

MODEL_PATH = 'pose_landmarker.task'

# Descargar modelo si no existe
if not os.path.exists(MODEL_PATH):
    print(f"📥 Cargando modelo MediaPipe Pose Landmarker... (0%)")
    url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task"
    try:
        def descargar_con_progreso(url, archivo):
            def mostrar_progreso(bloque, tamaño_bloque, tamaño_total):
                descargado = bloque * tamaño_bloque
                porcentaje = min(100, int((descargado / tamaño_total) * 100))
                print(f"📥 Cargando modelo... ({porcentaje}%)")
                sys.stdout.flush()
            urllib.request.urlretrieve(url, archivo, mostrar_progreso)
        
        descargar_con_progreso(url, MODEL_PATH)
        print("✅ Modelo cargado (100%)")
    except Exception as e:
        print(f"❌ Error al descargar el modelo: {e}")

filtro_color = [1.0, 1.0, 1.0]
cap = None

# Valores por defecto de emergencia
altura_user = 1.70
peso_user = 70.0
url_imagen_prenda = 'remera.png'

# Evaluamos los argumentos posicionales que inyectó Express vía consola
if len(sys.argv) > 3:
    try:
        altura_user = float(sys.argv[1])
        peso_user = float(sys.argv[2])
        url_imagen_prenda = sys.argv[3] # <-- Recibe la URL de Unsplash enviada desde React
        print(f"🚀 Python iniciado por Node. Prenda remota: {url_imagen_prenda}")
    except Exception as e:
        print(f"Error interpretando argumentos: {e}")

# ============================================================================
# 2. CONEXIÓN CON LA API DE TALLES
# ============================================================================

def calcular_talle_desde_api(producto_id, altura, peso):
    try:
        url = "http://localhost:3000/api/talles/recomendar"
        payload = {
            "producto_id": producto_id,
            "altura_cm": int(altura * 100) if altura < 10 else int(altura),
            "peso_kg": peso,
            "preferencia_calce": "regular"
        }
        response = requests.post(url, json=payload, timeout=2)
        data = response.json()
        if data.get('success'):
            talle = data['recomendacion']['talle']
            escalas = {'S': 0.88, 'M': 1.0, 'L': 1.12, 'XL': 1.25}
            return escalas.get(talle, 1.0), 1.0
        return 1.0, 1.0
    except:
        return 1.0, 1.0

# ============================================================================
# 3. INTERPRETADOR DE COMANDOS DE VOZ (Filtros de color)
# ============================================================================

def hilo_escucha_urbano():
    global filtro_color
    try:
        r = sr.Recognizer()
        mic = sr.Microphone()
    except Exception as e:
        print(f"⚠️ Reconocimiento de voz desactivado (Micrófono no disponible o PyAudio no instalado): {e}")
        return

    try:
        with mic as source:
            while True:
                try:
                    audio = r.listen(source, phrase_time_limit=2)
                    comando = r.recognize_google(audio, language="es-AR").lower()
                    if "rojo" in comando or "roja" in comando:
                        filtro_color = [0.7, 0.7, 1.5]
                    elif "azul" in comando:
                        filtro_color = [1.5, 0.7, 0.7]
                    elif "blanca" in comando or "original" in comando:
                        filtro_color = [1.0, 1.0, 1.0]
                except Exception as e:
                    continue
    except Exception as e:
        print(f"⚠️ Error en hilo de escucha: {e}")

threading.Thread(target=hilo_escucha_urbano, daemon=True).start()

# ============================================================================
# 4. DESCARGA E INYECCIÓN DE LA IMAGEN DE LA MUESTRA REAL
# ============================================================================

def descargar_y_preparar_remera(url_o_ruta):
    """
    Descarga la remera de internet, le inyecta canal alfa si es JPG 
    y la normaliza a 500x500 px eliminando los bordes excedentes.
    """
    print(f"👕 Cargando prenda... (0%)")
    sys.stdout.flush()
    
    img = None
    try:
        if url_o_ruta.startswith('http://') or url_o_ruta.startswith('https://'):
            print(f"👕 Cargando prenda... (25%)")
            sys.stdout.flush()
            
            req = urllib.request.Request(url_o_ruta, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                arr = np.asarray(bytearray(response.read()), dtype=np.uint8)
                img = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
            
            print(f"👕 Cargando prenda... (50%)")
            sys.stdout.flush()
        else:
            print(f"👕 Cargando prenda desde archivo... (25%)")
            sys.stdout.flush()
            img = cv2.imread(url_o_ruta, cv2.IMREAD_UNCHANGED)
            print(f"👕 Cargando prenda... (50%)")
            sys.stdout.flush()
            
        if img is None:
            print(f"👕 Cargando prenda por defecto... (75%)")
            sys.stdout.flush()
            return cv2.imread('remera.png', cv2.IMREAD_UNCHANGED)

        print(f"👕 Cargando prenda... (75%)")
        sys.stdout.flush()
        
        # Si no tiene transparencia, le acoplamos el canal Alfa (4 canales)
        if len(img.shape) == 2 or img.shape[2] == 3:
            b, g, r = cv2.split(img)
            a = np.ones(b.shape, dtype=b.dtype) * 255
            img = cv2.merge((b, g, r, a))

        alpha = img[:, :, 3]
        posiciones = np.where(alpha > 10)
        if posiciones[0].size > 0 and posiciones[1].size > 0:
            y_min, y_max = np.min(posiciones[0]), np.max(posiciones[0])
            x_min, x_max = np.min(posiciones[1]), np.max(posiciones[1])
            img_recortada = img[y_min:y_max, x_min:x_max]
            print(f"👕 Cargando prenda... (90%)")
            sys.stdout.flush()
            resultado = cv2.resize(img_recortada, (500, 500), interpolation=cv2.INTER_CUBIC)
            print(f"✅ Prenda cargada (100%)")
            sys.stdout.flush()
            return resultado
        
        print(f"👕 Cargando prenda... (90%)")
        sys.stdout.flush()
        resultado = cv2.resize(img, (500, 500), interpolation=cv2.INTER_CUBIC)
        print(f"✅ Prenda cargada (100%)")
        sys.stdout.flush()
        return resultado
    except Exception as e:
        print(f"⚠️ Error cargando prenda: {e}. Usando remera.png por defecto.")
        return cv2.imread('remera.png', cv2.IMREAD_UNCHANGED)

# Preparamos la tela real descargada antes de prender el bucle de video
print("\n🚀 Inicializando probador de Realidad Aumentada...")
sys.stdout.flush()
remera_tela = descargar_y_preparar_remera(url_imagen_prenda)
print("✅ ¡Probador listo! Abre http://localhost:5000 en tu navegador\n")
sys.stdout.flush()

# ============================================================================
# 5. GENERADOR DE FRAMES DE VIDEO
# ============================================================================

def generar_frames(altura, peso):
    global cap, filtro_color, remera_tela
    
    talle_auto, vert_auto = calcular_talle_desde_api(1, altura, peso)
    
    BaseOptions = mp.tasks.BaseOptions
    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    options = mp.tasks.vision.PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=mp.tasks.vision.RunningMode.VIDEO
    )
    
    cap = cv2.VideoCapture(0)
    puntos_suaves = np.zeros((4, 2))
    suavizado_iniciado = False

    with PoseLandmarker.create_from_options(options) as landmarker:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            frame = cv2.flip(frame, 1)
            h_v, w_v = frame.shape[:2]

            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)
            resultado = landmarker.detect_for_video(mp_image, int(time.time() * 1000))
            
            if resultado.pose_landmarks and remera_tela is not None:
                landmarks = resultado.pose_landmarks[0]
                nariz_y = landmarks[0].y * h_v
                
                pts_actuales = np.array([
                    [landmarks[12].x * w_v, landmarks[12].y * h_v],
                    [landmarks[11].x * w_v, landmarks[11].y * h_v],
                    [landmarks[24].x * w_v, landmarks[24].y * h_v],
                    [landmarks[23].x * w_v, landmarks[23].y * h_v]
                ])
                
                if not suavizado_iniciado:
                    puntos_suaves = pts_actuales
                    suavizado_iniciado = True
                else:
                    puntos_suaves = (puntos_suaves * 0.7) + (pts_actuales * 0.3)
                
                h_i, w_i = remera_tela.shape[:2]
                pts_origen = np.float32([[0, 0], [w_i, 0], [0, h_i], [w_i, h_i]])
                
                hombro_d, hombro_i = puntos_suaves[0], puntos_suaves[1]
                cadera_d, cadera_i = puntos_suaves[2], puntos_suaves[3]

                ancho_hombros = np.linalg.norm(hombro_d - hombro_i)
                pad_x = ancho_hombros * (talle_auto - 1.0) / 2

                pixeles_por_cm = ancho_hombros / 40.0
                distancia_13cm_en_px = 13.0 * pixeles_por_cm
                cuello_y_dinamico = nariz_y + distancia_13cm_en_px

                pts_destino = np.float32([
                    [hombro_d[0] - pad_x, cuello_y_dinamico],
                    [hombro_i[0] + pad_x, cuello_y_dinamico],
                    [hombro_d[0] - pad_x, cadera_d[1]],
                    [hombro_i[0] + pad_x, cadera_i[1]]
                ])
                
                matriz = cv2.getPerspectiveTransform(pts_origen, pts_destino)
                warped = cv2.warpPerspective(remera_tela, matriz, (w_v, h_v), borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0,0))
                
                mascara = warped[:, :, 3] / 255.0
                for canal in range(3):
                    canal_con_filtro = np.clip(warped[:, :, canal] * filtro_color[canal], 0, 255)
                    frame[:, :, canal] = (mascara * canal_con_filtro + (1 - mascara) * frame[:, :, canal]).astype(np.uint8)

                for pt in pts_destino:
                    cv2.circle(frame, (int(pt[0]), int(pt[1])), 6, (255, 255, 0), -1)
            
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret: continue
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

# ============================================================================
# 6. CAPA SERVIDOR FLASK (CON EX CONDICIÓN DE AUTO-APAGADO CONTRALADO)
# ============================================================================
app_flask = Flask(__name__)
CORS(app_flask)

@app_flask.route('/configurar', methods=['POST'])
def configurar():
    global altura_user, peso_user, url_imagen_prenda, remera_tela
    try:
        data = request.get_json() or {}
        altura_user = float(data.get('altura', 1.70))
        peso_user = float(data.get('peso', 70.0))
        url_imagen_prenda = data.get('imagen', 'remera.png')
        
        # Recargar la prenda
        remera_tela = descargar_y_preparar_remera(url_imagen_prenda)
        
        print(f"🔄 Configuración remota aplicada: H={altura_user}, W={peso_user}, Prenda={url_imagen_prenda}")
        return jsonify({"success": True, "message": "Configuración actualizada"})
    except Exception as e:
        print(f"❌ Error al configurar: {e}")
        return jsonify({"success": False, "error": str(e)}), 400

@app_flask.route('/video_feed')
def video_feed():
    return Response(generar_frames(altura_user, peso_user), mimetype='multipart/x-mixed-replace; boundary=frame')

@app_flask.route('/apagar')
def apagar():
    global cap
    # Destrucción controlada limpia para soltar la webcam de inmediato
    if cap is not None:
        cap.release()
        cap = None
    print("❌ Cámara liberada y en espera (Standby).")
    return jsonify({"success": True, "message": "Cámara liberada y en standby"})

if __name__ == "__main__":
    print("=" * 60)
    print("📹 PROBADOR URBANO AR - SERVIDOR INICIADO")
    print("=" * 60)
    print("✅ Estado: LISTO Y ESPERANDO CONEXIÓN")
    print("🌐 URL: http://localhost:5000")
    print("⏳ Nota: La cámara se activará cuando se conectes desde el navegador")
    print("=" * 60)
    print()
    app_flask.run(host='0.0.0.0', port=5000, threaded=True, debug=False)