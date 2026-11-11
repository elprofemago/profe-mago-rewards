// La app completa. Decide qué pantalla mostrar y le pasa los datos.
import { useEffect, useState } from 'react'
import { useDatos } from './datos.js'
import Cursos from './pantallas/Cursos.jsx'
import Curso from './pantallas/Curso.jsx'
import DarPuntos from './pantallas/DarPuntos.jsx'
import Tarjetas from './pantallas/Tarjetas.jsx'
import Escanear from './pantallas/Escanear.jsx'
import Premios from './pantallas/Premios.jsx'

const INICIO = { nombre: 'cursos' }

export default function App() {
  const [datos, setDatos] = useDatos()
  // Qué pantalla está abierta, por ejemplo { nombre: 'curso', cursoId: '...' }
  const [pantalla, setPantalla] = useState(INICIO)

  // Cada pantalla nueva se anota en el historial del navegador. Así el botón "atrás"
  // del celular vuelve a la pantalla anterior en vez de cerrar la app.
  useEffect(() => {
    history.replaceState({ pantalla: INICIO, nivel: 0 }, '')
    const alVolver = (evento) => {
      setPantalla(evento.state?.pantalla ?? INICIO)
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])

  // Ir a una pantalla nueva
  const ir = (nueva) => {
    const nivel = (history.state?.nivel ?? 0) + 1
    history.pushState({ pantalla: nueva, nivel }, '')
    setPantalla(nueva)
    window.scrollTo(0, 0)
  }

  // Volver a la pantalla anterior: lo mismo que hace el botón "atrás" del celular.
  const atras = () => {
    if ((history.state?.nivel ?? 0) > 0) history.back()
    else { setPantalla(INICIO); window.scrollTo(0, 0) }
  }

  const props = { datos, setDatos, ir, atras }

  if (pantalla.nombre === 'curso') return <Curso {...props} cursoId={pantalla.cursoId} />
  if (pantalla.nombre === 'puntos') return <DarPuntos {...props} estudianteId={pantalla.estudianteId} desde={pantalla.desde} />
  // Con premioId, el escáner sirve para canjear esa recompensa en vez de dar puntos.
  if (pantalla.nombre === 'escanear') return <Escanear key={pantalla.premioId ?? 'puntos'} {...props} premioId={pantalla.premioId} />
  if (pantalla.nombre === 'premios') return <Premios {...props} />
  if (pantalla.nombre === 'tarjetas') return <Tarjetas {...props} cursoId={pantalla.cursoId} />
  return <Cursos {...props} />
}
