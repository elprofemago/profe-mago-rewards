// Un curso: sus estudiantes (orden alfabético), buscador y agregar estudiantes pegando una lista.
import { useState } from 'react'
import { agregarEstudiantes, estudiantesDelCurso, iniciales } from '../datos.js'
import { leerExcel } from '../importarExcel.js'
import { IconoEstrella, IconoExcel, IconoImprimir, IconoMas, IconoVolver } from '../iconos.jsx'

const clave = (nombre) => nombre.toLocaleLowerCase('es').trim()

export default function Curso({ datos, setDatos, ir, atras, cursoId }) {
  const curso = datos.cursos.find((c) => c.id === cursoId)
  const [agregando, setAgregando] = useState(false)
  const [lista, setLista] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [avisoExcel, setAvisoExcel] = useState('')

  if (!curso) return null

  const estudiantes = estudiantesDelCurso(datos, cursoId)
  const filtrados = estudiantes.filter((e) =>
    e.nombre.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')),
  )
  // Una línea = un estudiante. Los que ya están en el curso no se repiten.
  const yaEstan = new Set(estudiantes.map((e) => clave(e.nombre)))
  const nombresPegados = [...new Set(lista.split('\n').map((n) => n.trim()).filter(Boolean))]
    .filter((n) => !yaEstan.has(clave(n)))

  const guardar = () => {
    setDatos(agregarEstudiantes(datos, cursoId, nombresPegados))
    setLista('')
    setAvisoExcel('')
    setAgregando(false)
  }

  const importar = async (evento) => {
    const archivo = evento.target.files[0]
    evento.target.value = '' // permite elegir el mismo archivo otra vez
    if (!archivo) return
    try {
      const nombres = await leerExcel(archivo)
      const nuevos = nombres.filter((n) => !yaEstan.has(clave(n)))
      const repetidos = nombres.length - nuevos.length
      if (nombres.length === 0) {
        setAvisoExcel('No encontré nombres en ese archivo. Revisa que tenga una columna "Nombres" o "Nombre".')
        return
      }
      setLista(nuevos.join('\n'))
      setAvisoExcel(
        `Encontré ${nombres.length} estudiantes.` +
          (repetidos ? ` ${repetidos} ya estaban en el curso y no se repiten.` : '') +
          ' Revisa la lista y toca "Agregar".',
      )
    } catch {
      setAvisoExcel('No pude leer ese archivo. Tiene que ser un Excel .xlsx.')
    }
  }

  return (
    <div className="pantalla">
      <header className="encabezado">
        <button className="volver" aria-label="Volver a mis cursos" onClick={atras}>
          <IconoVolver />
        </button>
        <div>
          <h1>{curso.nombre}</h1>
          <div className="sub">{estudiantes.length} estudiantes · orden alfabético</div>
        </div>
      </header>

      <div className="fila-2">
        <button
          className="boton boton-suave"
          disabled={estudiantes.length === 0}
          onClick={() => ir({ nombre: 'tarjetas', cursoId })}
        >
          <IconoImprimir /> Imprimir tarjetas
        </button>
        <button className="boton boton-suave" onClick={() => setAgregando(!agregando)}>
          <IconoMas /> Agregar estudiantes
        </button>
      </div>

      {agregando && (
        <div className="caja">
          <label className="boton boton-secundario" style={{ fontSize: 17 }}>
            <IconoExcel /> Importar desde Excel
            <input type="file" accept=".xlsx" onChange={importar} style={{ display: 'none' }} />
          </label>
          <span className="sub" style={{ textAlign: 'center' }}>
            Solo se toma el nombre y el primer apellido. El archivo no sale de este dispositivo.
          </span>
          {avisoExcel && <div className="aviso-info" role="status">{avisoExcel}</div>}
          <label htmlFor="lista-nombres" style={{ fontWeight: 800 }}>
            {lista ? 'Lista para agregar (puedes editarla)' : 'O pega los nombres, uno por línea'}
          </label>
          <textarea
            id="lista-nombres"
            className="campo"
            placeholder={'Nombre Apellido\nNombre Apellido\n...'}
            value={lista}
            onChange={(e) => setLista(e.target.value)}
          />
          <div className="fila-2">
            <button className="boton boton-suave" onClick={() => { setAgregando(false); setLista(''); setAvisoExcel('') }}>Cancelar</button>
            <button className="boton boton-primario" disabled={nombresPegados.length === 0} onClick={guardar}>
              Agregar {nombresPegados.length || ''}
            </button>
          </div>
        </div>
      )}

      {estudiantes.length > 0 && (
        <input
          type="search"
          className="campo"
          aria-label="Buscar estudiante"
          placeholder="Buscar estudiante"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      )}

      {estudiantes.length === 0 && !agregando && (
        <p className="vacio">Este curso todavía no tiene estudiantes.<br />Toca "Agregar estudiantes" y pega la lista.</p>
      )}

      {filtrados.length > 0 && (
        <div className="lista">
          {filtrados.map((e) => (
            <button key={e.id} className="fila" onClick={() => ir({ nombre: 'puntos', estudianteId: e.id })}>
              <span className="avatar">{iniciales(e.nombre)}</span>
              <span className="nombre">{e.nombre}</span>
              <span className="puntos"><IconoEstrella tamano={16} />{e.puntos}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
