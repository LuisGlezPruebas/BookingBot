# Casa Tamariu - Sistema de Reservas

Sistema de gestión de reservas para la casa de Tamariu. Permite a los usuarios administrar sus reservas y a los administradores gestionar solicitudes y ver estadísticas.

## Requisitos

- Docker y Docker Compose
- Node.js 20 (solo para desarrollo)
- Postgres (proporcionado a través de Docker)

## Desarrollo local

### Con Docker

1. Clona el repositorio
2. Crea un archivo `.env` basado en `.env.example`
3. Ejecuta el contenedor:

```bash
docker-compose up
```

La aplicación estará disponible en: http://localhost:5000

### Sin Docker (solo desarrollo)

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`
4. Inicia la aplicación:

```bash
npm run dev
```

## Despliegue en fly.io

1. Instala la CLI de Fly.io:

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh
```

2. Inicia sesión en fly.io:

```bash
fly auth login
```

3. Configura los secretos necesarios:

```bash
fly secrets set DATABASE_URL="postgres://user:password@host:port/database"
fly secrets set EMAIL_PASSWORD="your_email_password"
```

4. Despliega la aplicación:

```bash
fly deploy
```

## Estructura del proyecto

- `/client`: Frontend React con Vite
- `/server`: Backend Express
- `/shared`: Tipos y esquemas compartidos
- `Dockerfile` y `docker-compose.yml`: Configuración de Docker
- `fly.toml`: Configuración para despliegue en Fly.io

## Variables de entorno

Ver archivo `.env.example` para todas las variables requeridas