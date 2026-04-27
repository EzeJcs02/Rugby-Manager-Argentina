export const C = {
  bg:          '#0A0A0A',
  surface:     '#141414',
  card:        '#1C1C1C',
  border:      '#2A2A2A',
  primary:     '#2D6A4F',
  primaryLight:'#52B788',
  gold:        '#D4AF37',
  text:        '#FFFFFF',
  sub:         '#888888',
  muted:       '#444444',
  error:       '#EF4444',
  success:     '#22C55E',
  warning:     '#F59E0B',
};

export const S = {
  title:   { fontSize: 24, fontWeight: 'bold',   color: C.text },
  heading: { fontSize: 18, fontWeight: '600',    color: C.text },
  body:    { fontSize: 14, fontWeight: '400',    color: C.text },
  caption: { fontSize: 12, fontWeight: '400',    color: C.sub  },
  label:   { fontSize: 11, fontWeight: '600',    color: C.sub, textTransform: 'uppercase', letterSpacing: 1 },
};

export function attrColor(v) {
  if (v >= 85) return C.success;
  if (v >= 70) return C.gold;
  if (v >= 55) return C.warning;
  return C.error;
}

export function overall(j) {
  const attrs = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
  return Math.round(attrs.reduce((s, a) => s + (j[a] ?? 50), 0) / attrs.length);
}
