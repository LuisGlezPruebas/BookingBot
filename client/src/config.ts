/**
 * Configuración centralizada para la aplicación
 */

// URL base de la API - en desarrollo simplemente es la ruta relativa
export const API_URL = '';

/**
 * Obtiene la URL completa para una ruta de API
 * En la configuración actual, simplemente devuelve la ruta original
 * ya que el proxy de desarrollo de Vite se encarga de redirigir
 */
export function getApiUrl(path: string): string {
  return path;
}