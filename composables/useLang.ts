export const useLang = () => {
  return useState<'mk' | 'en' | 'sq'>('lang', () => 'mk')
}