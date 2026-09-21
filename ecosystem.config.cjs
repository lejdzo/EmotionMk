// PM2 Configuration for E-MOTION
// Node.js app runs on port 3000, Apache proxies from port 9000
//
// Start with: pm2 start ecosystem.config.cjs
// View logs: pm2 logs emotion
// Restart: pm2 restart emotion
// Stop: pm2 stop emotion

module.exports = {
  apps: [{
    name: 'emotion',
    script: './.output/server/index.mjs',
    cwd: '/var/www/html/static/emotion',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '127.0.0.1',
      NITRO_PORT: 3000,
      NITRO_HOST: '127.0.0.1'
    },
    error_file: '/var/www/html/static/emotion/logs/error.log',
    out_file: '/var/www/html/static/emotion/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
