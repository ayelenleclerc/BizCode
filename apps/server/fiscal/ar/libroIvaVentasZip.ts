import { ZipArchive as ZipArchiveCtor } from 'archiver'
import { PassThrough } from 'node:stream'

/**
 * @en Builds ZIP buffer with CBTV.txt and ALICUOTAS.txt for ARCA upload (#147).
 * @es Arma buffer ZIP con CBTV.txt y ALICUOTAS.txt para carga ARCA (#147).
 * @pt-BR Monta buffer ZIP com CBTV.txt e ALICUOTAS.txt para upload ARCA (#147).
 */
export async function buildLibroIvaVentasZip(
  cbtvLines: string[],
  alicuotasLines: string[],
): Promise<Buffer> {
  const cbtvBody = cbtvLines.length > 0 ? `${cbtvLines.join('\r\n')}\r\n` : ''
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
    archive.append(cbtvBody, { name: 'CBTV.txt' })
    archive.append(alicuotasBody, { name: 'ALICUOTAS.txt' })
    void archive.finalize()
  })
}
