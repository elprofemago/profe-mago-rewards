// Escanear la tarjeta de un estudiante con la cámara (o escribir su código a mano).
// Sin premioId: abre la pantalla para sumar o restar puntos.
// Con premioId: canjea esa recompensa y descuenta los puntos al tiro.
import { useEffect, useRef, useState } from 'react'
import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'
import { canjearPremio, deshacerMovimiento } from '../datos.js'
import { IconoCheck, IconoEstrella, IconoRegalo, IconoVolver } from '../iconos.jsx'

// El lector de QR usa un archivo .wasm. Lo servimos desde la propia app (no desde internet).
prepareZXingModule({
  overrides: { locateFile: (ruta, prefijo) => (ruta.endsWith('.wasm') ? wasmUrl : prefijo + ruta) },
})

// "k7m42q", " K7M-42Q " -> "K7M-42Q"
function limpiarCodigo(texto) {
  const c = String(texto).toUpperCase().replace(/[^A-Z0-9]/g, '')
  return c.length === 6 ? c.slice(0, 3) + '-' + c.slice(3) : c
}

export default function Escanear({ datos, setDatos, ir, atras, premioId }) {
  const video = useRef(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [codigoManual, setCodigoManual] = useState('')
  // Resultado del último canje: { estudiante, antes, despues, movimientoId } o { estudiante, falta }
  const [resultado, setResultado] = useState(null)

  const premio = premioId ? datos.premios.find((p) => p.id === premioId) : null
  const volver = atras

  // La cámara corre en un ciclo aparte; estas referencias le dan siempre los datos al día.
  const datosAlDia = useRef(datos)
  datosAlDia.current = datos
  const pausado = useRef(false) // mientras se muestra un resultado, la cámara no lee
  const ignorar = useRef({ codigo: '', hasta: 0 }) // evita canjear dos veces la misma tarjeta
  const alLeer = useRef(null)

  const buscar = (texto) => {
    const codigo = limpiarCodigo(texto)
    return datosAlDia.current.estudiantes.find((e) => e.codigo === codigo)
  }

  const abrir = (estudiante) => {
    navigator.vibrate?.(80) // pequeña vibración para saber que leyó
    if (!premioId) {
      ir({ nombre: 'puntos', estudianteId: estudiante.id, desde: 'escaner' })
      return
    }
    pausado.current = true
    const canje = canjearPremio(datosAlDia.current, estudiante.id, premioId)
    if (canje) {
      setDatos(canje.datos)
      setResultado({
        estudiante,
        antes: estudiante.puntos,
        despues: estudiante.puntos - premio.costo,
        movimientoId: canje.movimiento.id,
      })
    } else {
      navigator.vibrate?.([80, 80, 80])
      setResultado({ estudiante, falta: premio.costo - estudiante.puntos })
    }
  }
  alLeer.current = abrir

  const seguir = () => {
    // La misma tarjeta no se vuelve a leer durante 3 segundos (por si sigue frente a la cámara).
    ignorar.current = { codigo: resultado.estudiante.codigo, hasta: Date.now() + 3000 }
    setResultado(null)
    setCodigoManual('')
    pausado.current = false
  }

  const deshacer = () => {
    setDatos(deshacerMovimiento(datosAlDia.current, resultado.movimientoId))
    setResultado({ ...resultado, deshecho: true })
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
      if (v && v.readyState >= 2 && !pausado.current) {
        try {
          const [qr] = await detector.detect(v)
          if (qr && activo && !pausado.current) {
            const estudiante = buscar(qr.rawValue)
            const repetida =
              estudiante && estudiante.codigo === ignorar.current.codigo && Date.now() < ignorar.current.hasta
            if (estudiante && !repetida) {
              setAviso('')
              alLeer.current(estudiante)
              if (!premioId) { activo = false; return }
            }
            if (!estudiante && qr.rawValue !== ultimoDesconocido) {
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
    if (estudiante) { setAviso(''); abrir(estudiante) }
    else setAviso('No encontré ese código. Revisa que esté bien escrito.')
  }

  // Si la recompensa se borró mientras tanto, volvemos a la lista.
  if (premioId && !premio) {
    return (
      <div className="pantalla pantalla-oscura">
        <div className="aviso-error">Esa recompensa ya no existe.</div>
        <button className="boton boton-primario" onClick={volver}>Volver a recompensas</button>
      </div>
    )
  }

  return (
    <div className="pantalla pantalla-oscura">
      <header className="encabezado">
        <button className="volver" aria-label="Volver" onClick={volver}>
          <IconoVolver />
        </button>
        <h1>{premio ? 'Canjear recompensa' : 'Escanear tarjeta'}</h1>
      </header>

      {premio && (
        <div className="premio-elegido">
          <span className="avatar avatar-dorado"><IconoRegalo /></span>
          <span className="nombre">{premio.nombre}</span>
          <span className="puntos"><IconoEstrella />{premio.costo}</span>
        </div>
      )}

      {resultado && <Resultado resultado={resultado} premio={premio} seguir={seguir} deshacer={deshacer} />}

      <div className="visor" hidden={!!resultado}>
        <video ref={video} playsInline muted aria-label="Cámara" />
        <div className="marco" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </div>

      {!resultado && (error ? (
        <div className="aviso-error" role="alert">{error}</div>
      ) : (
        <p className="ayuda">
          {premio
            ? 'Apunta la cámara a la tarjeta del estudiante. Al leerla se descuentan los puntos.'
            : 'Apunta la cámara a la tarjeta. Se lee sola, sin apretar nada.'}
        </p>
      ))}
      {aviso && !resultado && <div className="aviso-error" role="status">{aviso}</div>}

      <form className="codigo-manual" onSubmit={enviarManual} hidden={!!resultado}>
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

// Lo que se ve después de escanear en modo canje: si se canjeó o cuántos puntos le faltan.
function Resultado({ resultado, premio, seguir, deshacer }) {
  const { estudiante, falta, deshecho } = resultado
  const primerNombre = estudiante.nombre.split(' ')[0]
  const puntos = (n) => (n === 1 ? '1 punto' : `${n} puntos`)

  return (
    <section className="ficha ficha-canje" role="status">
      <h2>{estudiante.nombre}</h2>
      {falta ? (
        <div className="aviso-error">
          No le alcanza. Tiene {puntos(estudiante.puntos)} y esta recompensa cuesta {premio.costo}.
          Le faltan {puntos(falta)}.
        </div>
      ) : deshecho ? (
        <div className="aviso-info">Canje anulado. {primerNombre} recuperó sus {premio.costo} puntos.</div>
      ) : (
        <>
          <div className="total">
            <span className="antes">{resultado.antes}</span>
            <span aria-hidden="true">→</span>
            <span className="despues"><IconoEstrella tamano={26} />{resultado.despues}</span>
          </div>
          <div className="aviso-exito"><IconoCheck />Canjeado: −{puntos(premio.costo)}</div>
        </>
      )}
      <button className="boton boton-primario" style={{ width: '100%' }} onClick={seguir}>
        Escanear otra tarjeta
      </button>
      {!falta && !deshecho && (
        <button className="boton boton-suave" style={{ width: '100%' }} onClick={deshacer}>
          Me equivoqué, deshacer
        </button>
      )}
    </section>
  )
}
