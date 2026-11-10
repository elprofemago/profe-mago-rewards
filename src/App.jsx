// La app completa. Decide qué pantalla mostrar y le pasa los datos.
import { useState } from 'react'
import { useDatos } from './datos.js'
import Cursos from './pantallas/Cursos.jsx'
import Curso from './pantallas/Curso.jsx'
import DarPuntos from './pantallas/DarPuntos.jsx'
import Tarjetas from './pantallas/Tarjetas.jsx'
import Escanear from './pantallas/Escanear.jsx'

export default function App() {
  const [datos, setDatos] = useDatos()
  // Qué pantalla está abierta, por ejemplo { nombre: 'curso', cursoId: '...' }
  const [pantalla, setPantalla] = useState({ nombre: 'cursos' })

  const ir = (nueva) => {
    setPantalla(nueva)
    window.scrollTo(0, 0)
  }
  const props = { datos, setDatos, ir }

  if (pantalla.nombre === 'curso') return <Curso {...props} cursoId={pantalla.cursoId} />
  if (pantalla.nombre === 'puntos') return <DarPuntos {...props} estudianteId={pantalla.estudianteId} desde={pantalla.desde} />
  if (pantalla.nombre === 'escanear') return <Escanear {...props} />
  if (pantalla.nombre === 'tarjetas') return <Tarjetas {...props} cursoId={pantalla.cursoId} />
  return <Cursos {...props} />
}
