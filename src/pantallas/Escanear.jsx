// Escanear la tarjeta de un estudiante con la cámara (o escribir su código a mano).
import { useEffect, useRef, useState } from 'react'
import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'
import { IconoVolver } from '../iconos.jsx'

// El lector de QR usa un archivo .wasm. Lo servimos desde la propia app (no desde internet).
prepareZXingModule({
  overrides: { locateFile: (ruta, prefijo) => (ruta.endsWith('.wasm') ? wasmUrl : prefijo + ruta) },
})

// "k7m42q", " K7M-42Q " -> "K7M-42Q"
function limpiarCodigo(texto) {
  const c = String(texto).toUpperCase().replace(/[^A-Z0-9]/g, '')
  return c.length === 6 ? c.slice(0, 3) + '-' + c.slice(3) : c
}

export default function Escanear({ datos, ir }) {
  const video = useRef(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [codigoManual, setCodigoManual] = useState('')

  const buscar = (texto) => {
    const codigo = limpiarCodigo(texto)
    return datos.estudiantes.find((e) => e.codigo === codigo)
  }

  const abrir = (estudiante) => {
    navigator.vibrate?.(80) // pequeña vibración para saber que leyó
    ir({ nombre: 'puntos', estudianteId: estudiante.id, desde: 'escaner' })
  }

  // Enciende la cámara al abrir la pantalla y la apaga al salir.
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no deja usar la cámara aquí. Abre la app con el enlace https.')
      return
    }
    let flujo = null
    let activo = true
    let ultimoDesconocido = ''
    const detector = new BarcodeDetector({ formats: ['qr_code'] })

    const revisar = async () => {
      if (!activo) return
      const v = video.current
      if (v && v.readyState >= 2) {
        try {
          const [qr] = await detector.detect(v)
          if (qr && activo) {
            const estudiante = buscar(qr.rawValue)
            if (estudiante) {
              activo = false
              abrir(estudiante)
              return
            }
            if (qr.rawValue !== ultimoDesconocido) {
              ultimoDesconocido = qr.rawValue
              setAviso('Esa tarjeta no es de ningún estudiante de tus cursos.')
            }
          }
        } catch {
          // Un cuadro que no se pudo leer: se intenta con el siguiente.
        }
      }
      setTimeout(revisar, 200)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((f) => {
        if (!activo) { f.getTracks().forEach((t) => t.stop()); return }
        flujo = f
        video.current.srcObject = f
        video.current.play().catch(() => {})
        revisar()
      })
      .catch((e) => {
        setError(
          e.name === 'NotAllowedError'
            ? 'No diste permiso para usar la cámara. Actívalo en el candado de la barra de direcciones y vuelve a entrar.'
            : 'No se pudo encender la cámara.',
        )
      })

    return () => {
      activo = false
      flujo?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const enviarManual = (evento) => {
    evento.preventDefault()
    const estudiante = buscar(codigoManual)
    if (estudiante) abrir(estudiante)
    else setAviso('No encontré ese código. Revisa que esté bien escrito.')
  }

  return (
    <div className="pantalla pantalla-oscura">
      <header className="encabezado">
        <button className="volver" aria-label="Volver a mis cursos" onClick={() => ir({ nombre: 'cursos' })}>
          <IconoVolver />
        </button>
        <h1>Escanear tarjeta</h1>
      </header>

      <div className="visor">
        <video ref={video} playsInline muted aria-label="Cámara" />
        <div className="marco" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </div>

      {error ? (
        <div className="aviso-error" role="alert">{error}</div>
      ) : (
        <p className="ayuda">Apunta la cámara a la tarjeta. Se lee sola, sin apretar nada.</p>
      )}
      {aviso && <div className="aviso-error" role="status">{aviso}</div>}

      <form className="codigo-manual" onSubmit={enviarManual}>
        <label htmlFor="codigo">¿No lee? Escribe el código de la tarjeta</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="codigo"
            className="campo"
            placeholder="ABC-123"
            autoCapitalize="characters"
            autoComplete="off"
            value={codigoManual}
            onChange={(e) => { setCodigoManual(e.target.value); setAviso('') }}
          />
          <button type="submit" className="boton boton-primario" disabled={!codigoManual.trim()}>Buscar</button>
        </div>
      </form>
    </div>
  )
}
