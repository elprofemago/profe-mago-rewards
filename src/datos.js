// Todo lo que la app "recuerda": cursos, estudiantes, recompensas y movimientos de puntos.
// En esta etapa se guarda solo en este navegador (localStorage).
// Más adelante lo cambiaremos por una base de datos en la nube.

import { useEffect, useState } from 'react'

const CLAVE = 'pmr-datos-v1'

// Las recompensas con que parte la app. El profe puede agregar más o quitarlas.
const PREMIOS_INICIALES = [
  { id: 'decima', nombre: 'Una décima para subir nota', costo: 5 },
  { id: 'jeans-day', nombre: 'Jeans day (ir con ropa de calle)', costo: 50 },
]

const DATOS_VACIOS = { cursos: [], estudiantes: [], movimientos: [], premios: PREMIOS_INICIALES }

function cargar() {
  try {
    const texto = localStorage.getItem(CLAVE)
    // Si los datos guardados son de antes de las recompensas, se agregan las iniciales.
    return texto ? { ...DATOS_VACIOS, ...JSON.parse(texto) } : DATOS_VACIOS
  } catch {
    return DATOS_VACIOS
  }
}

// Hook: entrega los datos y una función para cambiarlos. Cada cambio se guarda solo.
export function useDatos() {
  const [datos, setDatos] = useState(cargar)
  useEffect(() => {
    // Pide al teléfono que no borre estos datos cuando necesite espacio.
    navigator.storage?.persist?.().catch(() => {})
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos))
    } catch {
      // Sin espacio o almacenamiento bloqueado: la app sigue funcionando en memoria.
    }
  }, [datos])
  return [datos, setDatos]
}

function nuevoId() {
  return crypto.randomUUID()
}

// Código de la tarjeta, por ejemplo "K7M-42Q".
// Sin letras que se confunden (O/0, I/1/L) para que sea fácil de escribir.
const LETRAS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function nuevoCodigo(usados) {
  let codigo
  do {
    const azar = crypto.getRandomValues(new Uint32Array(6))
    const c = Array.from(azar, (n) => LETRAS[n % LETRAS.length]).join('')
    codigo = c.slice(0, 3) + '-' + c.slice(3)
  } while (usados.has(codigo))
  return codigo
}

// ---- Copia de seguridad: guardar todo en un archivo y cargarlo en otro dispositivo ----

export function descargarCopia(datos) {
  const archivo = new Blob([JSON.stringify({ app: 'profe-mago-rewards', version: 1, ...datos }, null, 1)], { type: 'application/json' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(archivo)
  enlace.download = `profe-mago-copia-${new Date().toISOString().slice(0, 10)}.json`
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

// Devuelve los datos del archivo, o null si no es una copia de esta app.
export async function leerCopia(archivo) {
  try {
    const d = JSON.parse(await archivo.text())
    if (d.app !== 'profe-mago-rewards' || !Array.isArray(d.cursos) || !Array.isArray(d.estudiantes)) return null
    return {
      cursos: d.cursos,
      estudiantes: d.estudiantes,
      movimientos: d.movimientos ?? [],
      premios: Array.isArray(d.premios) ? d.premios : PREMIOS_INICIALES,
    }
  } catch {
    return null
  }
}

// ---- Acciones: cada una recibe los datos actuales y devuelve los datos nuevos ----

export function crearCurso(datos, nombre) {
  const curso = { id: nuevoId(), nombre: nombre.trim() }
  return { ...datos, cursos: [...datos.cursos, curso] }
}

export function agregarEstudiantes(datos, cursoId, nombres) {
  const usados = new Set(datos.estudiantes.map((e) => e.codigo))
  const nuevos = nombres
    .map((n) => n.trim())
    .filter(Boolean)
    .map((nombre) => {
      const codigo = nuevoCodigo(usados)
      usados.add(codigo)
      return { id: nuevoId(), cursoId, nombre, codigo, puntos: 0 }
    })
  return { ...datos, estudiantes: [...datos.estudiantes, ...nuevos] }
}

// Suma (cantidad positiva) o resta (negativa). Los puntos nunca bajan de 0.
export function aplicarPuntos(datos, estudianteId, cantidad) {
  const estudiante = datos.estudiantes.find((e) => e.id === estudianteId)
  if (!estudiante) return datos
  const nuevoTotal = Math.max(0, estudiante.puntos + cantidad)
  const aplicado = nuevoTotal - estudiante.puntos
  if (aplicado === 0) return datos
  const movimiento = { id: nuevoId(), estudianteId, cantidad: aplicado, fecha: new Date().toISOString() }
  return {
    ...datos,
    estudiantes: datos.estudiantes.map((e) => (e.id === estudianteId ? { ...e, puntos: nuevoTotal } : e)),
    movimientos: [...datos.movimientos, movimiento],
  }
}

// ---- Recompensas ----

export function crearPremio(datos, nombre, costo) {
  const premio = { id: nuevoId(), nombre: nombre.trim(), costo }
  return { ...datos, premios: [...datos.premios, premio] }
}

export function borrarPremio(datos, premioId) {
  return { ...datos, premios: datos.premios.filter((p) => p.id !== premioId) }
}

// Descuenta el costo de la recompensa al estudiante, solo si le alcanzan los puntos.
// Devuelve { datos, movimiento } si se canjeó, o null si no le alcanza.
export function canjearPremio(datos, estudianteId, premioId) {
  const estudiante = datos.estudiantes.find((e) => e.id === estudianteId)
  const premio = datos.premios.find((p) => p.id === premioId)
  if (!estudiante || !premio || estudiante.puntos < premio.costo) return null
  const movimiento = {
    id: nuevoId(), estudianteId, cantidad: -premio.costo, premioId, fecha: new Date().toISOString(),
  }
  return {
    movimiento,
    datos: {
      ...datos,
      estudiantes: datos.estudiantes.map((e) => (e.id === estudianteId ? { ...e, puntos: e.puntos - premio.costo } : e)),
      movimientos: [...datos.movimientos, movimiento],
    },
  }
}

// Anula un movimiento (por ejemplo, un canje hecho por error) y devuelve los puntos.
export function deshacerMovimiento(datos, movimientoId) {
  const m = datos.movimientos.find((x) => x.id === movimientoId)
  if (!m) return datos
  return {
    ...datos,
    estudiantes: datos.estudiantes.map((e) => (e.id === m.estudianteId ? { ...e, puntos: Math.max(0, e.puntos - m.cantidad) } : e)),
    movimientos: datos.movimientos.filter((x) => x.id !== movimientoId),
  }
}

export function estudiantesDelCurso(datos, cursoId) {
  return datos.estudiantes
    .filter((e) => e.cursoId === cursoId)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export function iniciales(nombre) {
  return nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}
