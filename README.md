# URBANO AR - Probador de Ropa Virtual con Realidad Aumentada

¡Bienvenido al repositorio oficial del proyecto **URBANO AR**! Este es un e-commerce innovador que integra una tienda virtual completa junto con una experiencia inmersiva de Realidad Aumentada (AR) que permite a los usuarios "probarse" la ropa usando su cámara web antes de comprar.

---

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
- **Estructura Interna:** Rutas (`/routes`), Modelos (`/models`), Controladores (`/controllers`).

### `/probador`
El motor de Visión por Computadora y Realidad Aumentada.
- **Tecnologías:** Python, OpenCV, MediaPipe, SpeechRecognition, Flask.
- **Archivo Principal:** `probador_urbano.py` (Maneja el bucle de renderizado, captura de cámara y filtros dinámicos).

---

## Ejecución con Docker (Recomendado)

Todo el ecosistema de Urbano AR (Base de datos, Backend, Frontend y Probador) está dockerizado y configurado para levantarse de forma integrada con un único comando.

### Requisitos Previos
- **Docker** y **Docker Compose** instalados en el host.

### Cómo Iniciar

1. En la raíz del proyecto, ejecuta el siguiente comando:
   ```bash
   docker compose up --build
   ```
2. Esto levantará los siguientes servicios:
   - **`mysql-db`**: Base de datos MySQL en el puerto `3307` (mapeado internamente al `3306`).
   - **`backend`**: Servidor Express en `http://localhost:3000`.
   - **`frontend`**: Interfaz de React (Vite) en `http://localhost:5173`.
   - **`probador`**: Servidor de visión artificial Flask en `http://localhost:5000`.

### Inicialización y Semillado (Seed) Automático
El sistema de Docker incluye pausas y reintentos automáticos para asegurar que los servicios arranquen en el orden correcto y sin errores de conexión:
- El backend espera 5 segundos (`sleep 5`) y cuenta con una lógica interna de reintentos (hasta 5 intentos espaciados por 3 segundos cada uno) para conectarse a la base de datos.
- Una vez establecida la conexión, ejecuta automáticamente el script `seeders/seed.js` para poblar las tablas con datos de prueba (usuarios, categorías, variantes de prendas, guías de talles y 50 transacciones simuladas) si la base de datos está vacía.

### Acceso a la Cámara (Webcam) y Ejecución Híbrida Optimizada

Para desarrollo en **Windows y macOS**, Docker Desktop no tiene acceso nativo a la cámara web física debido a limitaciones del kernel de virtualización (WSL2/Hyper-V). Por este motivo, el proyecto implementa una **Arquitectura Híbrida Optimizada**:

1. **Docker Compose** levanta la Base de Datos MySQL, el Backend (Express) y el Frontend (React).
2. **El Probador de Python** corre de forma nativa en tu máquina host para acceder directamente a la cámara web sin problemas de drivers ni virtualización.
3. El backend está configurado para comunicarse con tu máquina host a través de `http://host.docker.internal:5000`.

#### Optimización en Modo Standby
El servidor de Python implementa un **Modo Standby**. Al cerrar el probador en la web:
- Libera la cámara web de inmediato (el led indicador se apaga).
- **El servidor de Python sigue activo en memoria**. Al no tener que reiniciarse, la próxima vez que te pruebes otra prenda, el probador cargará instantáneamente (en menos de 500 ms) sin el retardo habitual de carga de modelos de IA.

---

## Cómo Iniciar el Proyecto (Entorno Híbrido)

Sigue estos pasos en dos terminales diferentes desde la raíz del proyecto:

### Paso 1: Levantar los servicios web (Terminal 1)
Inicia los contenedores de Docker (Base de datos, Backend y Frontend):
```bash
docker compose up --build
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

