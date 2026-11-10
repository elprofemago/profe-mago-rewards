// Sumar o restar de 1 a 5 puntos a un estudiante. Muestra cómo queda el total antes de confirmar.
import { useState } from 'react'
import { aplicarPuntos, iniciales } from '../datos.js'
import { IconoCheck, IconoDerecha, IconoEstrella, IconoVolver } from '../iconos.jsx'

const COLOR_SUMAR = '#4B3BC4'
const COLOR_RESTAR = '#B4400B'

export default function DarPuntos({ datos, setDatos, ir, estudianteId, desde }) {
  const [modo, setModo] = useState('sumar')
  const [cantidad, setCantidad] = useState(1)
  const [listo, setListo] = useState(null) // mensaje de éxito después de confirmar

  const estudiante = datos.estudiantes.find((e) => e.id === estudianteId)
  if (!estudiante) return null
  const curso = datos.cursos.find((c) => c.id === estudiante.cursoId)

  const sumar = modo === 'sumar'
  const signo = sumar ? '+' : '−'
  const cambio = sumar ? cantidad : -cantidad
  const nuevoTotal = Math.max(0, estudiante.puntos + cambio)
  const palabra = (n) => (n === 1 ? 'punto' : 'puntos')
  const primerNombre = estudiante.nombre.split(' ')[0]
  // Si llegamos escaneando, "volver" regresa a la cámara para seguir con el siguiente.
  const deEscaner = desde === 'escaner'
  const volver = () => ir(deEscaner ? { nombre: 'escanear' } : { nombre: 'curso', cursoId: estudiante.cursoId })

  const elegirModo = (m) => { setModo(m); setListo(null) }
  const elegirCantidad = (n) => { setCantidad(n); setListo(null) }

  const confirmar = () => {
    const real = nuevoTotal - estudiante.puntos // al restar, puede ser menos (nunca bajo 0)
    setDatos(aplicarPuntos(datos, estudianteId, cambio))
    setListo(
      real === 0
        ? `${primerNombre} ya tenía 0 puntos.`
        : `${real > 0 ? '+' : '−'}${Math.abs(real)} ${palabra(Math.abs(real))} ${real > 0 ? 'para' : 'a'} ${primerNombre}`,
    )
  }

  return (
    <div className="pantalla" style={{ '--color-modo': sumar ? COLOR_SUMAR : COLOR_RESTAR }}>
      <header className="encabezado">
        <button className="volver" aria-label={deEscaner ? 'Volver a escanear' : 'Volver al curso'} onClick={volver}>
          <IconoVolver />
        </button>
        <span className="sub" style={{ fontWeight: 700, fontSize: 15 }}>{curso?.nombre}</span>
      </header>

      <section className="ficha">
        <span className="avatar">{iniciales(estudiante.nombre)}</span>
        <h1>{estudiante.nombre}</h1>
        <div className="total">
          {listo ? (
            <span className="despues"><IconoEstrella tamano={26} />{estudiante.puntos}</span>
          ) : (
            <>
              <span className="antes">{estudiante.puntos}</span>
              <IconoDerecha />
              <span className="despues"><IconoEstrella tamano={26} />{nuevoTotal}</span>
            </>
          )}
        </div>
        <span className="sub">puntos</span>
      </section>

      <div className="selector" role="radiogroup" aria-label="Sumar o restar">
        <button role="radio" aria-checked={sumar} onClick={() => elegirModo('sumar')}>Sumar</button>
        <button role="radio" aria-checked={!sumar} onClick={() => elegirModo('restar')}>Restar</button>
      </div>

      <div className="cantidades" role="radiogroup" aria-label="Cantidad de puntos">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={n === cantidad} onClick={() => elegirCantidad(n)}>
            {signo}{n}
          </button>
        ))}
      </div>

      <div className="espaciador" />

      {listo ? (
        <>
          <div className="aviso-exito" role="status"><IconoCheck />{listo}</div>
          <button className="boton boton-primario" onClick={volver}>
            {deEscaner ? 'Escanear otra tarjeta' : 'Volver al curso'}
          </button>
        </>
      ) : (
        <button className="boton" style={{ background: 'var(--color-modo)', color: '#FFFFFF', minHeight: 60 }} onClick={confirmar}>
          {sumar ? 'Sumar' : 'Restar'} {cantidad} {palabra(cantidad)}
        </button>
      )}
    </div>
  )
}
