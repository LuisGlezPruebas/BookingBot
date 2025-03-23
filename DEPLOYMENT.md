# Instrucciones para el Despliegue

Esta aplicación está diseñada para ser desplegada con el frontend y backend separados:
- **Frontend**: Alojado en Vercel
- **Backend**: Alojado en Railway

## Preparación para el Despliegue

### 1. Modificación del package.json

Antes de desplegar, edita el archivo `package.json` con los siguientes scripts:

```json
"scripts": {
  "dev": "tsx server/index.ts",
  "build": "npm run build-client && npm run build-server",
  "build-client": "vite build",
  "build-server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server",
  "start": "NODE_ENV=production node dist/server/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

## Despliegue del Backend (Railway)

1. Crea una cuenta en [Railway](https://railway.app/)
2. Crea un nuevo proyecto y conecta tu repositorio de GitHub
3. Configura las siguientes variables de entorno en Railway:
   - `PORT`: 5000 (o el puerto que prefieras)
   - `CORS_ORIGIN`: URL de tu frontend en Vercel (ej. https://tu-app.vercel.app)
   - `NODE_ENV`: production
   - `EMAIL_PASSWORD`: Tu contraseña de email para enviar notificaciones
   - `SENDGRID_API_KEY`: Tu API key de SendGrid (si utilizas este servicio)

4. Verifica que el archivo `Procfile` esté presente con el contenido:
   ```
   web: node dist/server/index.js
   ```

5. Una vez desplegado, anota la URL del backend (será algo como https://tu-app.railway.app)

## Despliegue del Frontend (Vercel)

1. Crea una cuenta en [Vercel](https://vercel.com/)
2. Importa tu repositorio de GitHub
3. Configura el directorio raíz como `/client`
4. Configura las variables de entorno:
   - `VITE_API_URL`: URL de tu backend en Railway (ej. https://tu-app.railway.app)

5. Asegúrate de que el archivo `vercel.json` esté presente en el directorio `/client` con la configuración adecuada

6. Despliega la aplicación

## Verificación del Despliegue

1. Accede a tu frontend desplegado en Vercel
2. Verifica que la aplicación puede conectarse correctamente al backend
3. Prueba las funcionalidades principales (autenticación, reservas, etc.)

## Solución de Problemas

- **Error CORS**: Asegúrate de que la variable `CORS_ORIGIN` en el backend tiene el valor correcto de tu frontend
- **Errores de conexión API**: Verifica que `VITE_API_URL` apunta correctamente a tu backend
- **Errores de envío de email**: Comprueba las variables de entorno relacionadas con el servicio de email