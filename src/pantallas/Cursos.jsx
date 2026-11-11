// Pantalla de inicio: la lista de cursos y un formulario para crear uno nuevo.
import { useState } from 'react'
import { crearCurso, descargarCopia, leerCopia } from '../datos.js'
import { IconoEscanear, IconoFlecha, IconoMas, IconoRegalo } from '../iconos.jsx'

export default function Cursos({ datos, setDatos, ir }) {
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')

  const guardar = (evento) => {
    evento.preventDefault()
    if (!nombre.trim()) return
    setDatos(crearCurso(datos, nombre))
    setNombre('')
    setCreando(false)
  }

  return (
    <div className="pantalla">
      <header className="encabezado">
        <img className="logo" src={`${import.meta.env.BASE_URL}icono-192.png`} alt="" />
        <div>
          <h1 style={{ fontSize: 20 }}>ProfeMago Rewards</h1>
          <div className="sub">Hola, profe</div>
        </div>
      </header>

      {datos.estudiantes.length > 0 && (
        <button className="boton boton-primario" style={{ minHeight: 64, fontSize: 20 }} onClick={() => ir({ nombre: 'escanear' })}>
          <IconoEscanear /> Escanear tarjeta
        </button>
      )}

      <button className="boton boton-dorado" onClick={() => ir({ nombre: 'premios' })}>
        <IconoRegalo /> Canjear recompensas
      </button>

      <h2 className="seccion">Mis cursos</h2>

      {datos.cursos.length === 0 && !creando && (
        <p className="vacio">Todavía no tienes cursos. Crea el primero para empezar.</p>
      )}

      {datos.cursos.length > 0 && (
        <div className="lista">
          {datos.cursos.map((curso) => {
            const cantidad = datos.estudiantes.filter((e) => e.cursoId === curso.id).length
            return (
              <button key={curso.id} className="fila" onClick={() => ir({ nombre: 'curso', cursoId: curso.id })}>
                <span className="nombre">
                  {curso.nombre}
                  <span className="detalle" style={{ display: 'block' }}>{cantidad} {cantidad === 1 ? 'estudiante' : 'estudiantes'}</span>
                </span>
                <IconoFlecha />
              </button>
            )
          })}
        </div>
      )}

      {creando ? (
        <form className="caja" onSubmit={guardar}>
          <label htmlFor="nombre-curso" style={{ fontWeight: 800 }}>Nombre del curso</label>
          <input
            id="nombre-curso"
            className="campo"
            placeholder="Por ejemplo: 3° Básico A"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
          />
          <div className="fila-2">
            <button type="button" className="boton boton-suave" onClick={() => setCreando(false)}>Cancelar</button>
            <button type="submit" className="boton boton-primario" disabled={!nombre.trim()}>Crear</button>
          </div>
        </form>
      ) : (
        <button className="boton boton-secundario" onClick={() => setCreando(true)}>
          <IconoMas /> Agregar curso
        </button>
      )}

      <Respaldo datos={datos} setDatos={setDatos} />
    </div>
  )
}

// Pasar los datos a otro dispositivo (o guardar un respaldo) con un archivo.
function Respaldo({ datos, setDatos }) {
  const [porCargar, setPorCargar] = useState(null) // copia leída, esperando confirmación
  const [aviso, setAviso] = useState('')

  const elegir = async (evento) => {
    const archivo = evento.target.files[0]
    evento.target.value = ''
    if (!archivo) return
    const copia = await leerCopia(archivo)
    if (copia) { setPorCargar(copia); setAviso('') }
    else setAviso('Ese archivo no es una copia de Profe Mago Rewards.')
  }

  const confirmar = () => {
    setDatos(porCargar)
    setPorCargar(null)
    setAviso('Copia cargada.')
  }

  return (
    <section className="caja" style={{ marginTop: 24 }}>
      <h2 className="seccion" style={{ margin: 0, fontSize: 18 }}>Copia de seguridad</h2>
      <span className="sub">Sirve para pasar tus cursos a otro dispositivo o guardarlos por si acaso.</span>
      <div className="fila-2">
        <button className="boton boton-suave" disabled={datos.cursos.length === 0} onClick={() => descargarCopia(datos)}>
          Descargar copia
        </button>
        <label className="boton boton-suave">
          Cargar copia
          <input type="file" accept=".json,application/json" onChange={elegir} style={{ display: 'none' }} />
        </label>
      </div>
      {porCargar && (
        <div className="aviso-error" role="alert">
          La copia trae {porCargar.cursos.length} cursos y {porCargar.estudiantes.length} estudiantes.
          Reemplazará todo lo que hay ahora en este dispositivo.
          <div className="fila-2" style={{ marginTop: 10 }}>
            <button className="boton boton-suave" onClick={() => setPorCargar(null)}>Cancelar</button>
            <button className="boton boton-primario" onClick={confirmar}>Reemplazar</button>
          </div>
        </div>
      )}
      {aviso && <div className="aviso-info" role="status">{aviso}</div>}
    </section>
  )
}
