import { useRef, useEffect } from 'react'

interface Props {
  width?: number
  height?: number
  onChange?: (dataUrl: string | null) => void
}

export default function SignaturePad({ width = 600, height = 160, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const hasStrokes = useRef(false)
  const last = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = Math.max(300, Math.round(width * (window.devicePixelRatio || 1)))
    canvas.height = Math.max(120, Math.round(height * (window.devicePixelRatio || 1)))
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.4
    ctx.strokeStyle = '#111827'
    clearCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getPos(e: PointerEvent | TouchEvent | MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as PointerEvent).clientX
    const clientY = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : (e as PointerEvent).clientY
    return {
      x: (clientX - rect.left) * (width / rect.width),
      y: (clientY - rect.top) * (height / rect.height)
    }
  }

  function pointerDown(e: PointerEvent | TouchEvent | MouseEvent) {
    e.preventDefault()
    drawing.current = true
    last.current = getPos(e)
  }
  function pointerMove(e: PointerEvent | TouchEvent | MouseEvent) {
    if (!drawing.current) return
    e.preventDefault()
    const p = getPos(e)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    hasStrokes.current = true
    last.current = p
  }
  function pointerUp(_event?: PointerEvent | TouchEvent | MouseEvent) {
    drawing.current = false
    emitChange()
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasStrokes.current = false
    onChange?.(null)
  }

  function emitChange() {
    const canvas = canvasRef.current
    if (!canvas) return
    onChange?.(hasStrokes.current ? canvas.toDataURL('image/png') : null)
  }

  // wire events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handlePointerDown = (e: PointerEvent) => pointerDown(e)
    const handlePointerMove = (e: PointerEvent) => pointerMove(e)
    const handlePointerUp = (e: PointerEvent) => pointerUp(e)
    canvas.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    // touch fallbacks
    canvas.addEventListener('touchstart', handlePointerDown as any, { passive: false })
    window.addEventListener('touchmove', handlePointerMove as any, { passive: false })
    window.addEventListener('touchend', handlePointerUp as any)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('touchstart', handlePointerDown as any)
      window.removeEventListener('touchmove', handlePointerMove as any)
      window.removeEventListener('touchend', handlePointerUp as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="signature-pad">
      <canvas ref={canvasRef} style={{ border: '1px dashed var(--border)', borderRadius: 8, touchAction: 'none' }} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button type="button" onClick={clearCanvas} className="secondary">Clear</button>
      </div>
    </div>
  )
}
