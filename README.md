# URBANO AR - Probador de Ropa Virtual con Realidad Aumentada

¡Bienvenido al repositorio oficial del proyecto **URBANO AR**! Este es un e-commerce innovador que integra una tienda virtual completa junto con una experiencia inmersiva de Realidad Aumentada (AR) que permite a los usuarios "probarse" la ropa usando su cámara web antes de comprar.

## Funcionalidades Actuales

El proyecto actualmente cuenta con tres grandes pilares operativos:

### 1. E-commerce
- **Catálogo de Productos:** Visualización de prendas en la página principal (`Home`).
- **Detalle de Producto:** Vista individualizada para consultar información detallada de cada prenda.
- **Carrito de Compras:** Gestión del carrito de compras integrado en la plataforma.
- **Autenticación y Usuarios:** Sistema de login/registro y gestión de usuarios.
- **Gestión Administrativa:** Control de productos, categorías y stock a través de controladores especializados.

### 2. Probador Virtual
- **Tracking Corporal en Tiempo Real:** Utiliza **OpenCV** y **MediaPipe** para detectar puntos clave del cuerpo (hombros, cadera, nariz) y proyectar la prenda sobre el usuario a través de la webcam.
- **Transmisión de Video (Streaming):** Envío del video procesado en tiempo real al frontend mediante un servidor embebido con **Flask** (`/video_feed`).
- **Comandos de Voz Integrados:** Capacidad de escuchar y procesar comandos de voz (ej. *"rojo"*, *"azul"*, *"blanca"*) para cambiar el color de la prenda dinámicamente usando reconocimiento de voz.
- **Apagado Controlado:** Finalización limpia del subproceso y liberación de la cámara desde la interfaz web.

### 3. Recomendador de Talles Inteligente
- Un motor de recomendación inteligente en el backend (`recomendadorController.js`) que calcula el talle ideal (S, M, L, XL, etc.) basándose en:
  - La **altura** (cm) y **peso** (kg) del usuario.
  - La **preferencia de calce** (regular, suelto/oversize).
  - Las tablas de medidas específicas almacenadas en la base de datos para cada prenda.
- El módulo Probador se comunica internamente con esta API para ajustar el ancho y dimensiones de la ropa proyectada en cámara basándose en el cálculo de talle.

---

## Estructura del Proyecto

El repositorio está dividido en 3 micro-entornos que trabajan de manera conjunta:

### `/frontend`
Contiene la interfaz de usuario de la tienda y la integración visual del probador.
- **Tecnologías:** React 19, Vite, Tailwind CSS 4, React Router Dom.
- **Componentes Clave:** `Home.jsx`, `Carrito.jsx`, `DetalleProducto.jsx`.

### `/backend`
El servidor central que maneja la base de datos, la API RESTful y el sistema de recomendación de talles.
- **Tecnologías:** Node.js, Express, Sequelize (ORM), MySQL2, JWT (JSON Web Tokens), Bcryptjs.
- **Estructura Interna:** Rutas (`/routes`), Modelos (`/models`), Controladores (`/controllers` como `authController`, `carritoController`, `recomendadorController`).

### `/probador`
El motor de Visión por Computadora y Realidad Aumentada.
- **Tecnologías:** Python, OpenCV, MediaPipe, SpeechRecognition, Flask.
- **Archivo Principal:** `probador_urbano.py` (Maneja el bucle de renderizado, captura de cámara y filtros dinámicos).

---

## Requisitos Previos

Para correr este proyecto en tu entorno local necesitarás:
- **Node.js** (v18 o superior)
- **Python** (v3.8 o superior)
- **MySQL** (Base de datos corriendo localmente)

## Instalación y Ejecución

*Nota: Asegúrate de tener configuradas tus variables de entorno (`.env`) en el directorio del backend con las credenciales de tu base de datos.*

1. **Levantar el Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Levantar el Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Dependencias del Probador:**
   Asegúrate de instalar los requerimientos antes de que el servidor o frontend intenten invocar el probador:
   ```bash
   cd probador
   pip install opencv-python mediapipe SpeechRecognition requests flask flask-cors numpy
   ```

