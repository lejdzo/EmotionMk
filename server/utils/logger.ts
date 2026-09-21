/**
 * Server-side logging utility
 * Logs to PM2 and/or file system
 */

interface LogContext {
  route?: string
  method?: string
  userId?: string
  duration?: number
  status?: number
  error?: string
}

class Logger {
  private prefix = '[EMOTION]'

  private formatTime(): string {
    return new Date().toISOString()
  }

  private formatContext(ctx: LogContext): string {
    const parts = []
    if (ctx.route) parts.push(`${ctx.method} ${ctx.route}`)
    if (ctx.userId) parts.push(`user=${ctx.userId}`)
    if (ctx.duration) parts.push(`${ctx.duration}ms`)
    if (ctx.status) parts.push(`status=${ctx.status}`)
    return parts.length ? ` [${parts.join(', ')}]` : ''
  }

  info(message: string, ctx?: LogContext) {
    const time = this.formatTime()
    const contextStr = this.formatContext(ctx || {})
    console.log(`${time} ${this.prefix} ℹ️  ${message}${contextStr}`)
  }

  error(message: string, error?: any, ctx?: LogContext) {
    const time = this.formatTime()
    const contextStr = this.formatContext(ctx || {})
    const errorMsg = error?.message || String(error)
    console.error(`${time} ${this.prefix} ❌ ${message}${contextStr}`)
    if (errorMsg) console.error(`   └─ ${errorMsg}`)
    if (error?.stack && process.env.NODE_ENV === 'development') {
      console.error(error.stack)
    }
  }

  warn(message: string, ctx?: LogContext) {
    const time = this.formatTime()
    const contextStr = this.formatContext(ctx || {})
    console.warn(`${time} ${this.prefix} ⚠️  ${message}${contextStr}`)
  }

  debug(message: string, ctx?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      const time = this.formatTime()
      const contextStr = this.formatContext(ctx || {})
      console.log(`${time} ${this.prefix} 🔍 ${message}${contextStr}`)
    }
  }

  database(operation: string, collection: string, duration: number, success: boolean) {
    const status = success ? '✅' : '❌'
    const time = this.formatTime()
    console.log(`${time} ${this.prefix} 🗄️  ${status} DB [${operation}] ${collection} (${duration}ms)`)
  }

  api(method: string, route: string, status: number, duration: number, userId?: string) {
    const statusEmoji = status < 300 ? '✅' : status < 400 ? '⚠️' : '❌'
    const time = this.formatTime()
    const user = userId ? ` user=${userId}` : ''
    console.log(`${time} ${this.prefix} ${statusEmoji} ${method} ${route} ${status} (${duration}ms)${user}`)
  }
}

export const logger = new Logger()
