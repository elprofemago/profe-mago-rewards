// La app completa. Decide qué pantalla mostrar y le pasa los datos.
import { useState } from 'react'
import { useDatos } from './datos.js'
import Cursos from './pantallas/Cursos.jsx'
import Curso from './pantallas/Curso.jsx'
import DarPuntos from './pantallas/DarPuntos.jsx'
import Tarjetas from './pantallas/Tarjetas.jsx'
import Escanear from './pantallas/Escanear.jsx'
import Premios from './pantallas/Premios.jsx'

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
  // Con premioId, el escáner sirve para canjear esa recompensa en vez de dar puntos.
  if (pantalla.nombre === 'escanear') return <Escanear key={pantalla.premioId ?? 'puntos'} {...props} premioId={pantalla.premioId} />
  if (pantalla.nombre === 'premios') return <Premios {...props} />
  if (pantalla.nombre === 'tarjetas') return <Tarjetas {...props} cursoId={pantalla.cursoId} />
  return <Cursos {...props} />
}
