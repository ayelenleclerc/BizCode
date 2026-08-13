/**
 * @en Public URL for an article image relative path stored on disk (#235/#257).
 * @es URL pública de una imagen de artículo (path relativo en disco) (#235/#257).
 * @pt-BR URL pública de uma imagem de artigo (path relativo em disco) (#235/#257).
 */
export function articuloImagePublicUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/')
  return `/uploads/articulos/${normalized}`
}
