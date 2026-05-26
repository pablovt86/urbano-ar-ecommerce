FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias de sistema para OpenCV, MediaPipe y PyAudio
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libasound2-dev \
    portaudio19-dev \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
RUN pip install --no-cache-dir \
    opencv-python-headless \
    mediapipe \
    SpeechRecognition \
    requests \
    flask \
    flask-cors \
    numpy \
    pyaudio

COPY . .

# Exponer puerto de Flask
EXPOSE 5000

CMD ["python", "probador_urbano.py"]
