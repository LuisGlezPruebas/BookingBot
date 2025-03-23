/**
 * Configuración centralizada para la aplicación
 */

// URL base de la API (se obtiene de variables de entorno o fallback a la URL local)
export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Obtiene la URL completa para una ruta de API
 * Si la ruta ya comienza con http(s), se devuelve sin cambios
 * Si no, se concatena con la URL base de la API
 */
export function getApiUrl(path: string): string {
  // Si la ruta ya es una URL completa o si estamos en desarrollo (donde el proxy funciona), devolvemos la ruta sin cambios
  if (path.startsWith('http') || !API_URL) {
    return path;
  }
  
  // Aseguramos que no haya doble slash entre la base y la ruta
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}