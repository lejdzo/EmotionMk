export function tField<T extends Record<string, any>>(
  value: T | string | null | undefined,
  lang: 'mk' | 'en' | 'sq',
  fallback: 'mk' | 'en' | 'sq' = 'mk'
) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[lang] ?? value[fallback] ?? Object.values(value)[0] ?? ''
}