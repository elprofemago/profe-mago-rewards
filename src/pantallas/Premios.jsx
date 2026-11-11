// Lista de recompensas. Se elige una y luego se escanea la tarjeta del estudiante para canjearla.
import { useState } from 'react'
import { borrarPremio, crearPremio } from '../datos.js'
import { IconoEstrella, IconoFlecha, IconoMas, IconoRegalo, IconoVolver } from '../iconos.jsx'

export default function Premios({ datos, setDatos, ir }) {
  const [editando, setEditando] = useState(false)
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [costo, setCosto] = useState('')
  const [porBorrar, setPorBorrar] = useState(null) // id de la recompensa esperando confirmación

  const costoNumero = Math.floor(Number(costo))
  const valido = nombre.trim() && costoNumero >= 1

  const guardar = (evento) => {
    evento.preventDefault()
    if (!valido) return
    setDatos(crearPremio(datos, nombre, costoNumero))
    setNombre('')
    setCosto('')
    setCreando(false)
  }

  const premios = [...datos.premios].sort((a, b) => a.costo - b.costo)
  const hayEstudiantes = datos.estudiantes.length > 0

  return (
    <div className="pantalla">
      <header className="encabezado">
        <button className="volver" aria-label="Volver a mis cursos" onClick={() => ir({ nombre: 'cursos' })}>
          <IconoVolver />
        </button>
        <h1>Recompensas</h1>
      </header>

      <p className="sub" style={{ margin: 0, color: 'var(--tenue)', lineHeight: 1.4 }}>
        {editando
          ? 'Puedes agregar recompensas nuevas o quitar las que ya no uses.'
          : 'Elige la recompensa y después escanea la tarjeta del estudiante. Los puntos se descuentan solos.'}
      </p>

      {!hayEstudiantes && !editando && (
        <div className="aviso-info">Primero agrega estudiantes a un curso para poder canjear.</div>
      )}

      {premios.length === 0 ? (
        <p className="vacio">No hay recompensas. Agrega la primera.</p>
      ) : (
        <div className="lista">
          {premios.map((premio) =>
            editando ? (
              <div key={premio.id} className="fila">
                <span className="nombre">
                  {premio.nombre}
                  <span className="detalle" style={{ display: 'block' }}>{premio.costo} puntos</span>
                </span>
                {porBorrar === premio.id ? (
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button className="boton boton-suave" onClick={() => setPorBorrar(null)}>No</button>
                    <button className="boton boton-peligro" onClick={() => { setDatos(borrarPremio(datos, premio.id)); setPorBorrar(null) }}>Quitar</button>
                  </span>
                ) : (
                  <button className="boton boton-suave" onClick={() => setPorBorrar(premio.id)}>Quitar</button>
                )}
              </div>
            ) : (
              <button
                key={premio.id}
                className="fila"
                disabled={!hayEstudiantes}
                onClick={() => ir({ nombre: 'escanear', premioId: premio.id })}
              >
                <span className="avatar avatar-dorado"><IconoRegalo /></span>
                <span className="nombre">{premio.nombre}</span>
                <span className="puntos"><IconoEstrella />{premio.costo}</span>
                <IconoFlecha />
              </button>
            ),
          )}
        </div>
      )}

      {editando && (creando ? (
        <form className="caja" onSubmit={guardar}>
          <label htmlFor="nombre-premio" style={{ fontWeight: 800 }}>Nombre de la recompensa</label>
          <input
            id="nombre-premio"
            className="campo"
            placeholder="Por ejemplo: Salir antes a recreo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
          />
          <label htmlFor="costo-premio" style={{ fontWeight: 800 }}>¿Cuántos puntos cuesta?</label>
          <input
            id="costo-premio"
            className="campo"
            type="number"
            inputMode="numeric"
            min="1"
            placeholder="Por ejemplo: 20"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />
          <div className="fila-2">
            <button type="button" className="boton boton-suave" onClick={() => setCreando(false)}>Cancelar</button>
            <button type="submit" className="boton boton-primario" disabled={!valido}>Agregar</button>
          </div>
        </form>
      ) : (
        <button className="boton boton-secundario" onClick={() => setCreando(true)}>
          <IconoMas /> Agregar recompensa
        </button>
      ))}

      <div className="espaciador" />

      <button
        className="boton boton-suave"
        onClick={() => { setEditando(!editando); setCreando(false); setPorBorrar(null) }}
      >
        {editando ? 'Listo' : 'Agregar o quitar recompensas'}
      </button>
    </div>
  )
}
