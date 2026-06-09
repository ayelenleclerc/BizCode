/**
 * @en Triggers browser download of a CSV blob.
 * @es Dispara descarga en el navegador de un blob CSV.
 * @pt-BR Dispara download no navegador de um blob CSV.
 */
export function downloadCsvBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
