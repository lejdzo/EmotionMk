export const useLoggerScreen = () => {
  return useState<boolean>('logger', () => true)
}