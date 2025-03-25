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

**Nota**: La base de datos se inicializará automáticamente con usuarios y reservas predefinidas gracias al script en `scripts/init-db.sql`.

### Sin Docker (solo desarrollo)

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`
4. Inicia una instancia de PostgreSQL y actualiza las variables de entorno en `.env`
5. Aplica las migraciones:

```bash
npm run db:push
```

6. (Opcional) Para inicializar datos de prueba, ejecuta:

```bash
psql -U tu_usuario -d tu_base_de_datos -f scripts/init-db.sql
```

7. Inicia la aplicación:

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

3. Crea una base de datos PostgreSQL en Fly.io (si no tienes una):

```bash
fly postgres create
```

4. Configura los secretos necesarios:

```bash
fly secrets set DATABASE_URL="postgres://usuario:contraseña@host:puerto/basededatos"
fly secrets set PGHOST="host"
fly secrets set PGUSER="usuario"
fly secrets set PGPASSWORD="contraseña"
fly secrets set PGDATABASE="basededatos"
fly secrets set PGPORT="puerto"
fly secrets set EMAIL_PASSWORD="tu_contraseña_de_email"
```

5. Despliega la aplicación:

```bash
fly deploy
```

6. (Opcional) Inicializa datos de ejemplo:

```bash
fly ssh console -C "psql \$DATABASE_URL -f scripts/init-db.sql"
```

## Estructura del proyecto

- `/client`: Frontend React con Vite
- `/server`: Backend Express
- `/shared`: Tipos y esquemas compartidos
- `/scripts`: Scripts de utilidad, incluyendo inicialización de base de datos
- `Dockerfile` y `docker-compose.yml`: Configuración de Docker
- `fly.toml`: Configuración para despliegue en Fly.io

## Características

- Gestión de reservas con diferentes estados (pendiente, aprobada, rechazada, cancelada)
- Visualización de calendario anual con colores según estado
- Panel de administración con estadísticas y gestión de solicitudes
- Notificaciones por correo electrónico para nuevas reservas y cambios de estado
- Interfaz adaptativa para dispositivos móviles y escritorio
- Multiidioma (español)

## Variables de entorno

Ver archivo `.env.example` para todas las variables requeridas