import { ZipArchive as ZipArchiveCtor } from 'archiver'
import { PassThrough } from 'node:stream'

/**
 * @en Builds ZIP buffer with CBTU.txt and ALICUOTAS.txt for purchases book (#306).
 * @es Arma buffer ZIP con CBTU.txt y ALICUOTAS.txt para libro compras (#306).
 * @pt-BR Monta buffer ZIP com CBTU.txt e ALICUOTAS.txt para livro compras (#306).
 */
export async function buildLibroIvaComprasZip(
  cbtuLines: string[],
  alicuotasLines: string[],
): Promise<Buffer> {
  const cbtuBody = cbtuLines.length > 0 ? `${cbtuLines.join('\r\n')}\r\n` : ''
  const alicuotasBody = alicuotasLines.length > 0 ? `${alicuotasLines.join('\r\n')}\r\n` : ''

  return new Promise((resolve, reject) => {
    const pass = new PassThrough()
    const chunks: Buffer[] = []
    pass.on('data', (chunk: Buffer) => chunks.push(chunk))
    pass.on('end', () => resolve(Buffer.concat(chunks)))
    pass.on('error', reject)

    const archive = new ZipArchiveCtor({ zlib: { level: 9 } })
    archive.on('error', reject)
    archive.pipe(pass)
    archive.append(cbtuBody, { name: 'CBTU.txt' })
    archive.append(alicuotasBody, { name: 'ALICUOTAS.txt' })
    void archive.finalize()
  })
}
