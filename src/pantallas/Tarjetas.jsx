// Hoja con las tarjetas de un curso, lista para imprimir y recortar.
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { estudiantesDelCurso } from '../datos.js'
import { IconoEstrella, IconoImprimir, IconoVolver } from '../iconos.jsx'

export default function Tarjetas({ datos, ir, cursoId }) {
  const curso = datos.cursos.find((c) => c.id === cursoId)
  const estudiantes = curso ? estudiantesDelCurso(datos, cursoId) : []
  // Imagen QR de cada estudiante: { codigo: 'data:image/png...' }
  const [qrs, setQrs] = useState({})

  useEffect(() => {
    let cancelado = false
    Promise.all(
      estudiantes.map((e) =>
        QRCode.toDataURL(e.codigo, { margin: 1, width: 300, color: { dark: '#15122B', light: '#FFFFFF' } })
          .then((url) => [e.codigo, url]),
      ),
    ).then((pares) => { if (!cancelado) setQrs(Object.fromEntries(pares)) })
    return () => { cancelado = true }
  }, [estudiantes.map((e) => e.codigo).join()])

  if (!curso) return null

  return (
    <div className="pantalla" style={{ maxWidth: 820 }}>
      <header className="encabezado no-imprimir">
        <button className="volver" aria-label="Volver al curso" onClick={() => ir({ nombre: 'curso', cursoId })}>
          <IconoVolver />
        </button>
        <div style={{ flex: 1 }}>
          <h1>Tarjetas · {curso.nombre}</h1>
          <div className="sub">{estudiantes.length} tarjetas, 8 por hoja</div>
        </div>
      </header>

      <button className="boton boton-primario no-imprimir" onClick={() => window.print()}>
        <IconoImprimir /> Imprimir
      </button>

      <div className="hoja-tarjetas">
        {estudiantes.map((e) => (
          <div key={e.id} className="tarjeta">
            <div className="izquierda">
              <div className="marca"><IconoEstrella tamano={14} borde="#F4B400" /> Profe Mago Rewards</div>
              <div className="nombre-est">{e.nombre}</div>
              <div className="curso-est">{curso.nombre}</div>
              <div className="codigo">{e.codigo}</div>
            </div>
            <div className="derecha">
              {qrs[e.codigo] && <img src={qrs[e.codigo]} alt={`Código QR de ${e.nombre}`} />}
              <span>Muestra esta tarjeta para ganar puntos</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
