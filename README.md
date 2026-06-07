# URBANO AR - E-commerce + Probador Virtual con AR

E-commerce con tienda virtual y probador de ropa en Realidad Aumentada. Pruébate la ropa con tu cámara web antes de comprar.

---

## 🚀 Inicio Rápido

### 🔧 Paso 0: Verificación Automática (IMPORTANTE - HACER PRIMERO)

**Windows:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

Este script verifica:
- ✅ Docker instalado
- ✅ Python instalado
- ✅ Puertos disponibles (asigna dinámicamente si están ocupados)
- ✅ Dependencias de Python

**Si algo falla, te dirá exactamente qué instalar. No hay excusas de "no me anda".**

### 1️⃣ Levantar Backend, Frontend y Base de Datos con Docker

```bash
docker compose up --build
```

Esto inicia automáticamente:
- **Base de datos MySQL** → `localhost:3307` (o dinámicamente)
- **Backend (Node.js)** → `http://localhost:3000`
- **Frontend (React)** → `http://localhost:5173`

### 2️⃣ Ejecutar el Probador de AR en Local (Python)

Abre **otra terminal** en la raíz del proyecto:

```bash
cd probador
# Si usas venv
.\.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Luego:
python probador_urbano.py
```

El probador se conectará automáticamente al backend en Docker y estará listo en `http://localhost:5000`.

---

## ✨ Características

- **E-commerce completo:** Catálogo, carrito, login, perfil de usuario
- **Probador Virtual:** Proyecta ropa en tiempo real sobre tu cámara
- **Recomendador de talles:** Calcula el talle ideal según altura y peso
- **Comandos de voz:** Di "rojo", "azul", "blanca" para cambiar colores

---

## 📁 Estructura

- **`/backend`** - Node.js + Express + MySQL
- **`/frontend`** - React + Vite + Tailwind
- **`/probador`** - Python + OpenCV + MediaPipe + Flask

---

## ⚠️ Nota: Probador Local

El probador se ejecuta **siempre localmente desde Python** (no en Docker) porque necesita acceso directo a la cámara web. Ya está configurado para conectarse automáticamente al backend que corre en Docker.
```
*Esto levantará el e-commerce, migrará y semillará automáticamente la base de datos MySQL con datos de prueba si se encuentra vacía.*

### Paso 2: Iniciar el Probador de Ropa localmente (Terminal 2)
Ve a la carpeta del probador, instala las dependencias de Python y corre el servidor:
```bash
cd probador
pip install -r requirements.txt
python probador_urbano.py
```
> *Nota:* Si la instalación de `pyaudio` falla debido a la falta del compilador de C++ en Windows, puedes instalar el resto de librerías individualmente omitiendo `pyaudio`:
> `pip install opencv-python mediapipe SpeechRecognition requests flask flask-cors numpy`
> El probador funcionará al 100% y desactivará los comandos de voz de manera segura.

### Paso 3: Probar en el Navegador
Abre **`http://localhost:5173`** en tu navegador. Navega al catálogo, entra al detalle de un producto, ingresa tus medidas y presiona **Probar en Espejo Virtual**. ¡El probador conectará directamente tu webcam e iniciará al instante!

