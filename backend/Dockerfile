FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Se agrega una pausa de 5 segundos para que la DB se levante completamente y luego se corre el seed antes de iniciar el dev server.
CMD ["sh", "-c", "sleep 5 && node seeders/seed.js && npm run dev"]
