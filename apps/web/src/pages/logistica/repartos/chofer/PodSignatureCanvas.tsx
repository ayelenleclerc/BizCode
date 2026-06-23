import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  onChange: (dataUrl: string | null) => void
}

export default function PodSignatureCanvas({ onChange }: Props) {
  const { t } = useTranslation('pod')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }, [])

  const emitChange = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL('image/png'))
  }

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    drawing.current = true
    canvas.setPointerCapture(e.pointerId)
    const { x, y } = pointerPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { x, y } = pointerPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handlePointerUp = () => {
    if (!drawing.current) return
    drawing.current = false
    emitChange()
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange(null)
  }

  return (
    <div data-testid="pod-signature-canvas">
      <p id="pod-signature-label" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {t('signatureLabel')}
      </p>
      <canvas
        ref={canvasRef}
        width={320}
        height={160}
        role="img"
        aria-labelledby="pod-signature-label"
        className="w-full max-w-md border border-slate-300 dark:border-slate-600 rounded bg-white touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <button
        type="button"
        onClick={handleClear}
        className="mt-2 text-sm underline text-slate-600 dark:text-slate-400"
        data-testid="pod-signature-clear"
      >
        {t('signatureClear')}
      </button>
    </div>
  )
}
