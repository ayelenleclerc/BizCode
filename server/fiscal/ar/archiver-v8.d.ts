declare module 'archiver' {
  import type { Writable } from 'node:stream'

  export interface Archiver extends Writable {
    on(event: 'error', listener: (err: Error) => void): this
    pipe<T extends NodeJS.WritableStream>(destination: T): T
    append(source: string, data: { name: string }): this
    finalize(): Promise<void>
  }

  export class ZipArchive implements Archiver {
    constructor(options?: { zlib?: { level?: number } })
    on(event: 'error', listener: (err: Error) => void): this
    pipe<T extends NodeJS.WritableStream>(destination: T): T
    append(source: string, data: { name: string }): this
    finalize(): Promise<void>
  }
}
