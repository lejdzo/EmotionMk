# Logging Documentation

## Server-Side Logging

### Logger Utility
Located in `server/utils/logger.ts`

**Usage:**
```typescript
import { logger } from '~/server/utils/logger'

// Info
logger.info('User logged in', { userId: 'user123' })

// Errors
logger.error('Database connection failed', error, { duration: 1500 })

// Database operations
logger.database('FIND', 'products', 45, true)

// API endpoints
logger.api('GET', '/api/products', 200, 123, 'user123')
```

### MongoDB Logging
Located in `server/utils/mongodb-logged.ts`

Use the logged functions instead of direct MongoDB calls:
```typescript
import { loggedFind, loggedInsertOne } from '~/server/utils/mongodb-logged'

// Find with logging
const products = await loggedFind('products', { active: true })

// Insert with logging
await loggedInsertOne('products', { name: 'Product', active: true })
```

### API Logging Middleware
Located in `server/middleware/logging.ts`

Automatically logs:
- HTTP method and path
- Response status code
- Duration in milliseconds
- Skips health checks and static files

### Logs Output Format

```
2026-03-07T12:34:56.789Z [EMOTION] ℹ️  User logged in [user=user123]
2026-03-07T12:34:57.123Z [EMOTION] 🗄️  ✅ DB [FIND] products (45ms)
2026-03-07T12:34:58.456Z [EMOTION] ✅ GET /api/products 200 (123ms) user=user123
```

## Client-Side Logging

### Logger Composable
Located in `composables/useClientLogger.ts`

**Usage in Vue components:**
```typescript
const logger = useClientLogger()

// Log errors
logger.error('Failed to load products', error, { page: 'products' })

// Log warnings
logger.warn('Image failed to load', { component: 'ProductCard' })

// Log info
logger.info('Products loaded successfully', { page: 'products' })
```

### Client Error Reporting
Client errors are automatically sent to `/api/logs` endpoint for server-side logging.

## PM2 Log Management

View logs:
```bash
# All PM2 logs
pm2 logs emotion

# Last 100 lines
pm2 logs emotion --lines 100

# No stream (one-time read)
pm2 logs emotion --nostream

# Real-time monitoring
pm2 monit
```

## Production Considerations

1. **Disable client-side log streaming to server** for sensitive data
   - Edit `useClientLogger.ts` and comment out `sendToServer()` call

2. **Log file rotation**
   - PM2 automatically rotates logs
   - Configure in ecosystem.config.cjs if needed

3. **Log levels in production**
   - Set `NODE_ENV=production` to disable debug logs
   - Only errors and important info are logged

4. **Monitor with PM2 Plus**
   - Optional service for remote log aggregation
   - `pm2 plus` command to enable

## Examples

### API Route with Logging
```typescript
import { logger } from '~/server/utils/logger'
import { loggedFind } from '~/server/utils/mongodb-logged'

export default defineEventHandler(async (event) => {
  const start = Date.now()
  
  try {
    const products = await loggedFind('products', { active: true })
    
    const duration = Date.now() - start
    logger.api('GET', '/api/products', 200, duration)
    
    return { ok: true, data: products }
  } catch (error) {
    logger.error('Failed to fetch products', error)
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
```

### Vue Component with Error Logging
```vue
<script setup>
const logger = useClientLogger()
const route = useRoute()

try {
  const { data } = await useFetch('/api/products')
} catch (error) {
  logger.error(
    'Failed to load products',
    error,
    { page: route.path, component: 'ProductsPage' }
  )
}
</script>
```

## Monitoring Tips

1. Watch logs in real-time:
   ```bash
   pm2 logs emotion
   ```

2. Check for errors:
   ```bash
   pm2 logs emotion | grep "❌"
   ```

3. Monitor database performance:
   ```bash
   pm2 logs emotion | grep "🗄️"
   ```

4. Check API response times:
   ```bash
   pm2 logs emotion | grep "✅" | tail -20
   ```
