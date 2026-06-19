# Urbano AR E-commerce

Tienda de ropa con probador virtual en tiempo real. Stack: **React + Vite** (frontend), **Node.js + Express + MySQL** (backend) y **Python + OpenCV + MediaPipe** (probador AR con cámara).

## Arquitectura

```
┌─────────────────┐     :5173      ┌─────────────────┐     :3000      ┌──────────────┐
│  Frontend React │ ──────────────▶ │  Backend Node   │ ─────────────▶ │  MySQL/Maria │
│  (Vite)         │                 │  (Express)      │                │  DB          │
└─────────────────┘                 └────────┬────────┘                └──────────────┘
                                           │ spawn python
                                           ▼
                                  ┌─────────────────┐     :5000
                                  │ probador_urbano │ ◀── video_feed (webcam)
                                  │ (Flask + CV)    │
                                  └─────────────────┘
```

| Servicio        | Puerto | Descripción                          |
|-----------------|--------|--------------------------------------|
| Frontend (Vite) | 5173   | Catálogo, detalle, probador avanzado |
| Backend (API)   | 3000   | REST API + imágenes estáticas        |
| Probador Python | 5000   | Stream de cámara con overlay de ropa |

---

## Requisitos previos

- **Node.js** 18+ y npm
- **MySQL** 8+ o **MariaDB** 10.4+
- **Python** 3.10+ (solo si querés usar el probador AR con cámara)
- **Webcam** (para el probador virtual)
- Conexión a internet (MediaPipe se carga desde CDN en el probador avanzado del browser)

---

## 1. Base de datos

### Crear la base

```sql
CREATE DATABASE urbano_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### Configurar variables de entorno

Creá `backend/.env`:

```env
DB_HOST=127.0.0.1
DB_NAME=urbano_db
DB_USER=root
DB_PASS=tu_password
PORT=3000
```

### Poblar datos

**Opción A — Restaurar backup (recomendado, trae productos y usuarios):**

```bash
mysql -u root -p urbano_db < backend/config/database/backup-base.sql
```

**Opción B — Seed desde Node (borra y recrea tablas con Sequelize):**

```bash
cd backend
node seeders/seed.js
```

**Opción C — Seed de productos con guías de talle (requiere DB ya existente):**

```bash
cd backend
node seed.js
```

### Usuarios de prueba (backup / seeders)

| Rol     | Email              | Contraseña |
|---------|--------------------|------------|
| Admin   | admin@urbano.com   | 123456     |
| Cliente | cliente1@gmail.com | 123456     |

---

## 2. Imágenes de productos

Las rutas en la base apuntan a archivos locales. Creá la carpeta y copiá las imágenes ahí:

```
backend/public/images/
```

Archivos referenciados en el backup:

```
BrownLeatherJacket.png
DressOrange.png
JeansWoman1.png
fleece-jacket-isolated-on-transparent-background-free-png.webp
hoodie.png
LongFuzzyCoat.png
LongFuzzyCoatWithoutCenter_(1).png
LongTrechCoat.png
LongTrenchCoatWithoutCenter.png
Manjeans2WithoutCenter.png
TopColoresSinMangas.png
TrenchRed.png
TrendyUpperComboWoman1.png
remera.png          # fallback del probador Python
remera_negra.png    # opcional, usado en variantes
```

> Si faltan imágenes, el frontend muestra placeholders de Unsplash. El probador AR necesita al menos `hoodie.png` o la imagen del producto que elijas.

---

## 3. Backend (API)

```bash
cd backend
npm install
npm run dev      # desarrollo con nodemon
# npm start      # producción
```

Verificá que levante:

```
✅ Base de datos sincronizada. Tablas listas.
🚀 Servidor en puerto 3000
```

Probar: [http://localhost:3000/api/productos](http://localhost:3000/api/productos)

---

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173)

> El frontend apunta a `http://localhost:3000` para la API. Si cambiás el puerto del backend, actualizá las URLs en `frontend/src/pages/`.

---

## 5. Probador AR con cámara (Python)

Se levanta **automáticamente** cuando abrís el probador desde el detalle de un producto. Node ejecuta `provador/probador_urbano.py`, que expone el stream en el puerto 5000.

### Instalar dependencias Python

```bash
cd provador
pip install opencv-python mediapipe flask flask-cors numpy requests SpeechRecognition pyaudio
```

En Windows, si `pyaudio` falla:

```bash
pip install pipwin
pipwin install pyaudio
```

### Descargar modelo MediaPipe

El archivo `pose_landmarker.task` no está en el repo (es pesado). Descargalo y guardalo en `provador/`:

```bash
# PowerShell (Windows)
curl -o provador/pose_landmarker.task "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
```

Renombrá el archivo a `pose_landmarker.task` si hace falta, o ajustá la ruta en `probador_urbano.py` (línea `MODEL_PATH`).

### Probar manualmente

```bash
cd provador
python probador_urbano.py 1.70 70 hoodie.png torso superior
```

Stream: [http://localhost:5000/video_feed](http://localhost:5000/video_feed)

Para apagar el proceso desde el frontend se llama a `http://localhost:5000/apagar`.

### Comandos de voz (opcional)

El script escucha el micrófono en background y usa **Google Speech Recognition** para cambiar el filtro de color ("rojo", "azul", "blanca"). Requiere internet y permiso de micrófono.

---

## 6. Flujo de uso

1. Levantá MySQL, backend y frontend.
2. Entrá a [http://localhost:5173](http://localhost:5173) y navegá el catálogo.
3. En un producto, podés:
   - **Probador clásico (cámara):** abre el modal con stream AR en puerto 5000.
   - **Probador avanzado:** ruta `/probadorAvanzado/:id` — overlay en browser con MediaPipe + TensorFlow.js (sin Python).
4. Login admin/cliente vía `POST /api/auth/login` con el token JWT en header `Authorization: Bearer <token>`.

---

## Scripts útiles

| Comando | Ubicación | Qué hace |
|---------|-----------|----------|
| `npm run dev` | `backend/` | API con hot-reload |
| `npm start` | `backend/` | API en producción |
| `npm run dev` | `frontend/` | UI con Vite HMR |
| `npm run build` | `frontend/` | Build estático en `dist/` |
| `node seeders/seed.js` | `backend/` | Resetea DB + datos demo |
| `node seed.js` | `backend/` | Repuebla productos y guías de talle |
| `node poblarRemeras.js` | `backend/` | Seed opcional desde Unsplash (requiere API key) |

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listado de productos |
| GET | `/api/productos/:id` | Detalle con imágenes y variantes |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/registro` | Registro de usuario |
| POST | `/api/talles/recomendar` | Recomendador de talles |
| POST | `/api/sistema/configurar` | Sincroniza producto_id, altura y peso del probador |
| POST | `/api/sistema/abrir-probador` | Lanza el script Python |
| POST | `/api/sistema/procesar-vestidor-ia` | Guarda foto del probador avanzado |
| GET | `/images/:archivo` | Imágenes estáticas de productos |

---

## Producción (referencia)

1. **Backend:** `npm start` detrás de un process manager (PM2, systemd). Variables en `.env`.
2. **Frontend:** `npm run build` y servir `frontend/dist/` con nginx o el mismo Express.
3. **MySQL:** instancia dedicada, usuario con permisos mínimos.
4. **Python:** el probador AR no escala bien en serverless; requiere máquina con cámara o rediseño. Para demo local está bien.
5. Cambiá el secret JWT hardcodeado (`SECRETO_SUPER_SEGURO`) por una variable de entorno antes de deployar.

---

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| `Error de DB` al iniciar backend | Verificá MySQL corriendo y credenciales en `.env` |
| Imágenes rotas en el catálogo | Copiá PNGs a `backend/public/images/` |
| Probador no muestra cámara | Verificá Python instalado, modelo `pose_landmarker.task` y permiso de webcam |
| `python` no reconocido (Windows) | Usá `py` o agregá Python al PATH; en `app.js` podés cambiar `'python'` por `'py'` |
| CORS / API no responde | Backend debe estar en puerto 3000 |
| Probador avanzado no carga pose | Revisá conexión a internet (CDN jsdelivr) |

---

## Estructura del proyecto

```
urbano-ar-ecommerc/
├── backend/           # API Express + Sequelize
│   ├── app.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── public/images/ # imágenes de productos (crear manualmente)
│   └── config/database/backup-base.sql
├── frontend/          # React + Vite + Tailwind
│   └── src/pages/
├── provador/          # Probador AR Python
│   └── probador_urbano.py
└── README.md
```
