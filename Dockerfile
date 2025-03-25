FROM node:20-slim

WORKDIR /app

# Copiar los archivos de dependencias primero para mejorar el cacheo
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto que usa la aplicación
EXPOSE 5000

# Definir variables de entorno para producción
ENV NODE_ENV=production

# Comando para ejecutar la aplicación
CMD ["npm", "start"]