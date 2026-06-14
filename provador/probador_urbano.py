# ============================================================================
# PROBADOR VIRTUAL URBANO - VERSIÓN CORREGIDA Y ORDENADA
# ============================================================================

import cv2
import mediapipe as mp
import time
import numpy as np
import os
import threading
import speech_recognition as sr
import sys
import requests
import urllib.request
from flask import Flask, Response
from flask_cors import CORS

# ============================================================================
# 1. ARGUMENTOS NODE.JS
# ============================================================================

DIR_ACTUAL = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(DIR_ACTUAL, 'pose_landmarker.task')

filtro_color = [1.0, 1.0, 1.0]
cap = None

altura_user = 1.70
peso_user = 70.0
url_imagen_prenda = 'remera.png'
tipo_overlay = "long_coat"
tipo_prenda = "superior"

print("ARGV:", sys.argv)

if len(sys.argv) >= 4:
    try:
        altura_user = float(sys.argv[1])
        peso_user = float(sys.argv[2])
        raw_prenda = sys.argv[3]

        if len(sys.argv) >= 5:
            tipo_overlay = sys.argv[4]

        if len(sys.argv) >= 6:
            tipo_prenda = sys.argv[5]  

        if not raw_prenda.startswith('http'):
            url_imagen_prenda = f"http://localhost:3000/images/{raw_prenda}"
        else:
            url_imagen_prenda = raw_prenda

        print(f"🚀 Prenda: {url_imagen_prenda}")

    except Exception as e:
        print(f"Error args: {e}")

# ============================================================================
# 2. API TALLES
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
# 3. VOZ (OPCIONAL)
# ============================================================================

def hilo_escucha_urbano():
    global filtro_color
    r = sr.Recognizer()
    with sr.Microphone() as source:
        while True:
            try:
                audio = r.listen(source, phrase_time_limit=2)
                comando = r.recognize_google(audio, language="es-AR").lower()

                if "rojo" in comando:
                    filtro_color = [0.7, 0.7, 1.5]
                elif "azul" in comando:
                    filtro_color = [1.5, 0.7, 0.7]
                elif "blanca" in comando:
                    filtro_color = [1.0, 1.0, 1.0]

            except:
                continue

threading.Thread(target=hilo_escucha_urbano, daemon=True).start()

# ============================================================================
# 4. CARGA IMAGEN
# ============================================================================

def descargar_y_preparar_remera(url_o_ruta):
    try:
        if url_o_ruta.startswith('http'):
            req = urllib.request.Request(url_o_ruta, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                arr = np.asarray(bytearray(response.read()), dtype=np.uint8)
                img = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
        else:
            img = cv2.imread(url_o_ruta, cv2.IMREAD_UNCHANGED)

        if img is None:
            return cv2.imread('remera.png', cv2.IMREAD_UNCHANGED)

        if len(img.shape) == 2 or img.shape[2] == 3:
            b, g, r = cv2.split(img)
            a = np.ones(b.shape, dtype=b.dtype) * 255
            img = cv2.merge((b, g, r, a))

        alpha = img[:, :, 3]
        pos = np.where(alpha > 10)

        if pos[0].size > 0:
            y_min, y_max = np.min(pos[0]), np.max(pos[0])
            x_min, x_max = np.min(pos[1]), np.max(pos[1])
            img = img[y_min:y_max, x_min:x_max]

        return img

    except:
        return cv2.imread('remera.png', cv2.IMREAD_UNCHANGED)

# ============================================================================
# INIT PRIMERA PRENDA
# ============================================================================

remera_tela = descargar_y_preparar_remera(url_imagen_prenda)

# ============================================================================
# MODE ROUTER
# ============================================================================
def get_garment_mode(tipo_prenda, tipo_overlay):

    if tipo_prenda == "inferior":
        return "lower_body"

    if tipo_overlay == "long_coat":
        return "long_upper_body"

    return "upper_body"

# ============================================================================
# 5. FRAME GENERATOR
# ============================================================================

def generar_frames(altura, peso):
    global cap, filtro_color, remera_tela

    talle_auto, _ = calcular_talle_desde_api(1, altura, peso)

    mp_pose = mp.tasks.vision.PoseLandmarker
    BaseOptions = mp.tasks.BaseOptions

    options = mp.tasks.vision.PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=mp.tasks.vision.RunningMode.VIDEO
    )

    cap = cv2.VideoCapture(0)

    puntos_suaves = np.zeros((4, 2))
    suavizado_iniciado = False

    with mp_pose.create_from_options(options) as landmarker:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            h_v, w_v = frame.shape[:2]

            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)
            result = landmarker.detect_for_video(mp_image, int(time.time() * 1000))

            if result.pose_landmarks and remera_tela is not None:
           
                l = result.pose_landmarks[0]

                pts = np.array([
                    [l[12].x * w_v, l[12].y * h_v],
                    [l[11].x * w_v, l[11].y * h_v],
                    [l[24].x * w_v, l[24].y * h_v],
                    [l[23].x * w_v, l[23].y * h_v],
                ])

                if not suavizado_iniciado:
                    puntos_suaves = pts
                    suavizado_iniciado = True
                else:
                    puntos_suaves = puntos_suaves * 0.85 + pts * 0.15

                hombro_d, hombro_i, cadera_d, cadera_i = puntos_suaves

              

                
                rodilla_d = np.array([
                    l[26].x * w_v,
                    l[26].y * h_v
                ])

                rodilla_i = np.array([
                    l[25].x * w_v,
                    l[25].y * h_v
                ])
                

                cv2.circle(frame, (int(rodilla_d[0]), int(rodilla_d[1])), 10, (0,255,0), -1)
                cv2.circle(frame, (int(rodilla_i[0]), int(rodilla_i[1])), 10, (0,255,0), -1)
                largo_sobretodo = (
                    rodilla_d[1] +
                    rodilla_i[1]
                ) / 2
  
                tobillo_d = np.array([
                    l[28].x * w_v,
                    l[28].y * h_v
                ])

                tobillo_i = np.array([
                    l[27].x * w_v,
                    l[27].y * h_v
                ])

                final_pierna_y = (
                    tobillo_d[1] +
                    tobillo_i[1]
                ) / 2
                cv2.circle(
                    frame,
                    (int(tobillo_d[0]), int(tobillo_d[1])),
                    10,
                    (255,0,0),
                    -1
                )

                cv2.circle(
                    frame,
                    (int(tobillo_i[0]), int(tobillo_i[1])),
                    10,
                    (255,0,0),
                    -1
                )
                

                h_i, w_i = remera_tela.shape[:2]

                mode = get_garment_mode(tipo_prenda,tipo_overlay)
                print(
                        "TIPO_PRENDA:",
                        tipo_prenda,
                        "TIPO_OVERLAY:",
                        tipo_overlay,
                        "MODE:",
                        mode,
                        flush=True
                    )

                # ======================================================
                # LOWER BODY (PANTALÓN)
                # ======================================================

                if mode == "lower_body":
                    
                    cintura_y = (cadera_d[1] + cadera_i[1]) / 2
                    pierna = final_pierna_y
                    ancho = np.linalg.norm(cadera_d - cadera_i)

                    pad = ancho * 0.18

                    print("ANCHO CADERA:", int(ancho))
                    print("PAD:", int(pad))

                    ancho_final = (cadera_d[0] + pad) - (cadera_i[0] - pad)
                    print("ANCHO FINAL:", int(ancho_final))
                    cv2.circle(
                        frame,
                        (int(tobillo_d[0]), int(tobillo_d[1])),
                        10,
                        (255,0,0),
                        -1
                    )

                    cv2.circle(
                        frame,
                        (int(tobillo_i[0]), int(tobillo_i[1])),
                        10,
                        (255,0,0),
                        -1
                    )


                    x_izq = min(cadera_i[0], cadera_d[0])
                    x_der = max(cadera_i[0], cadera_d[0])
                    pts_destino = np.float32([
                    [x_izq - pad, cintura_y],
                    [x_der + pad, cintura_y],
                    [x_izq - pad, pierna],
                    [x_der + pad, pierna],
                    ])
                elif mode == "long_upper_body":

                    ancho = np.linalg.norm(hombro_d - hombro_i)
                    pad = ancho * 0.12
                    cuello = (
                        (hombro_d[1] + hombro_i[1]) / 2
                    ) - (ancho * 0.12)

                    largo_sobretodo = (
                        rodilla_d[1] +
                        rodilla_i[1]
                    ) / 2

                    pts_destino = np.float32([
                        [hombro_d[0] - pad, cuello],
                        [hombro_i[0] + pad, cuello],
                        [hombro_d[0] - pad, largo_sobretodo],
                        [hombro_i[0] + pad, largo_sobretodo],
                    ])
                # ======================================================
                # UPPER BODY (REMERAS / CAMPERAS)
                # ======================================================

                else:

                    ancho = np.linalg.norm(hombro_d - hombro_i)
                    pad = ancho * 0.12

                    cuello = ((hombro_d[1] + hombro_i[1]) / 2) - (ancho * 0.12)

                    pts_destino = np.float32([
                        [hombro_d[0] - pad, cuello],
                        [hombro_i[0] + pad, cuello],
                        [hombro_d[0] - pad, cadera_d[1]],
                        [hombro_i[0] + pad, cadera_i[1]],
                    ])

                # ======================================================
                # WARP FINAL
                # ======================================================

                x1 = int(w_i * 0.2)
                y1 = int(h_i * 0.1)
                x2 = int(w_i * 0.8)
                y2 = int(h_i * 0.95)

                pts_origen = np.float32([
                    [x2, y1],
                    [x1, y1],
                    [x2, y2],
                    [x1, y2],
                ])
                 
             

                M = cv2.getPerspectiveTransform(pts_origen, pts_destino)
                warped = cv2.warpPerspective(remera_tela, M, (w_v, h_v), borderValue=(0,0,0,0))

                alpha = warped[:, :, 3] / 255.0

                for c in range(3):
                    frame[:, :, c] = (alpha * warped[:, :, c] + (1 - alpha) * frame[:, :, c]).astype(np.uint8)
       
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue

            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' +
                   buffer.tobytes() + b'\r\n')
            
# ============================================================================
# 6. FLASK SERVER
# ============================================================================

app_flask = Flask(__name__)
CORS(app_flask)

@app_flask.route('/video_feed')
def video_feed():
    return Response(generar_frames(altura_user, peso_user),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app_flask.route('/apagar')
def apagar():
    os._exit(0)

if __name__ == "__main__":
    print("🚀 Probador Urbano activo")
    app_flask.run(host="0.0.0.0", port=5000, threaded=True, debug=False)