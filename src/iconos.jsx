// Íconos dibujados con SVG (líneas simples). Se usan como <IconoVolver />, etc.

const base = {
  fill: 'none', stroke: 'currentColor', strokeWidth: 2,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

export function IconoEstrella({ tamano = 18, color = '#F4B400', borde = '#C98F00' }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill={color} stroke={borde} strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconoVolver() {
  return <svg width="24" height="24" viewBox="0 0 24 24" {...base} strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
}

export function IconoFlecha() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...base} stroke="#5B5775"><path d="M9 18l6-6-6-6" /></svg>
}

export function IconoMas() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...base} strokeWidth="2.2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
}

export function IconoImprimir() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base}>
      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

export function IconoEscanear() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...base}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  )
}

export function IconoExcel() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13l4 5" /><path d="M12 13l-4 5" />
    </svg>
  )
}

export function IconoCheck() {
  return <svg width="24" height="24" viewBox="0 0 24 24" {...base} strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
}

export function IconoDerecha() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...base} strokeWidth="2.2"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
}
