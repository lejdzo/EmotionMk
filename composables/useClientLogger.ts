/**
 * Client-side logger utility
 * For logging errors and important events in the browser
 */

interface ClientLogContext {
  page?: string
  component?: string
  error?: Error
}

class ClientLogger {
  private prefix = '[EMOTION-CLIENT]'

  private formatTime(): string {
    return new Date().toLocaleTimeString()
  }

  error(message: string, error?: Error, ctx?: ClientLogContext) {
    const time = this.formatTime()
    const page = ctx?.page ? ` [${ctx.page}]` : ''
    const component = ctx?.component ? ` {${ctx.component}}` : ''
    
    console.error(
      `%c${time} ${this.prefix} ❌ ${message}${page}${component}`,
      'color: red; font-weight: bold'
    )
    
    if (error?.message) {
      console.error(`   └─ ${error.message}`)
    }
    if (error?.stack) {
      console.error(error.stack)
    }

    // Send to server for logging (optional)
    this.sendToServer('error', message, { error: error?.message, ...ctx })
  }

  warn(message: string, ctx?: ClientLogContext) {
    const time = this.formatTime()
    const page = ctx?.page ? ` [${ctx.page}]` : ''
    
    console.warn(
      `%c${time} ${this.prefix} ⚠️  ${message}${page}`,
      'color: orange; font-weight: bold'
    )
  }

  info(message: string, ctx?: ClientLogContext) {
    const time = this.formatTime()
    const page = ctx?.page ? ` [${ctx.page}]` : ''
    
    console.log(
      `%c${time} ${this.prefix} ℹ️  ${message}${page}`,
      'color: blue; font-weight: normal'
    )
  }

  debug(message: string, ctx?: ClientLogContext) {
    if (process.env.NODE_ENV === 'development') {
      const time = this.formatTime()
      const page = ctx?.page ? ` [${ctx.page}]` : ''
      
      console.log(
        `%c${time} ${this.prefix} 🔍 ${message}${page}`,
        'color: gray; font-style: italic'
      )
    }
  }

  private sendToServer(level: string, message: string, data?: any) {
    // Only send errors to server for monitoring
    if (level === 'error') {
      try {
        $fetch('/api/logs', {
          method: 'POST',
          body: {
            level,
            message,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...data
          }
        }).catch(err => console.error('Failed to send client log:', err))
      } catch (e) {
        // Silently fail - don't create infinite loop
      }
    }
  }
}

export const useClientLogger = () => new ClientLogger()
