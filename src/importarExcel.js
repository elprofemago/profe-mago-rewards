// Lee un Excel (.xlsx) con la lista del curso y saca SOLO "Nombre Apellido" de cada estudiante.
// El archivo se lee dentro del navegador: no se sube a ningún lado
// y el resto de las columnas (RUT, dirección, apoderados, etc.) se ignora.

export async function leerExcel(archivo) {
  // Se carga solo cuando se usa, para que la app abra más rápido.
  const { readSheet } = await import('read-excel-file/browser')
  const filas = await readSheet(archivo)
  return nombresDesdeFilas(filas)
}

// "MATRÍCULA" -> "matricula", para comparar títulos de columnas sin importar tildes ni mayúsculas.
function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// "DE LA FUENTE" -> "De La Fuente", "EVA-LUNA" -> "Eva-Luna"
function bonito(texto) {
  return String(texto ?? '')
    .trim()
    .toLocaleLowerCase('es')
    .replace(/(^|[\s-])(\p{L})/gu, (_, antes, letra) => antes + letra.toLocaleUpperCase('es'))
    .replace(/\s+/g, ' ')
}

// Busca en las primeras filas los títulos de las columnas de nombre y apellido.
function buscarColumnas(filas) {
  for (let i = 0; i < Math.min(filas.length, 15); i++) {
    const titulos = filas[i].map(normalizar)
    // Columnas del apoderado o de otras personas no sirven
    const delEstudiante = (t) => !/apoderado|padre|madre|profesor|tutor/.test(t)

    const nombres = titulos.findIndex((t) => delEstudiante(t) && /^nombres?( del (alumno|estudiante))?$/.test(t))
    const apellido = titulos.findIndex((t) => delEstudiante(t) && /(primer apellido|apellido paterno|^apellidos?$)/.test(t))
    if (nombres !== -1) return { fila: i, nombres, apellido }

    const completo = titulos.findIndex((t) => delEstudiante(t) && /(nombre completo|^alumnos?$|^estudiantes?$|^nombre$)/.test(t))
    if (completo !== -1) return { fila: i, completo }
  }
  return null
}

export function nombresDesdeFilas(filas) {
  const columnas = buscarColumnas(filas)
  const resultado = []

  if (columnas) {
    for (const fila of filas.slice(columnas.fila + 1)) {
      if (columnas.completo !== undefined) {
        const completo = bonito(fila[columnas.completo])
        if (completo) resultado.push(completo)
        continue
      }
      // Primer nombre + primer apellido, por ejemplo "ZOE ISABEL" + "QUIROZ" -> "Zoe Quiroz"
      const primerNombre = bonito(String(fila[columnas.nombres] ?? '').trim().split(/\s+/)[0])
      const apellido = columnas.apellido === -1 ? '' : bonito(fila[columnas.apellido])
      const nombre = [primerNombre, apellido].filter(Boolean).join(' ')
      if (nombre) resultado.push(nombre)
    }
  } else {
    // Sin títulos reconocibles: se asume que la primera columna tiene los nombres.
    for (const fila of filas) {
      const nombre = bonito(fila[0])
      if (nombre && /\p{L}/u.test(nombre)) resultado.push(nombre)
    }
  }
  return resultado
}
