/** Assemble des classes CSS en ignorant les valeurs vides : cn('a', cond && 'b'). */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
