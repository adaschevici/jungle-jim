module.exports = {
  apps: [
    {
      name: 'api',
      script: 'src/server.js',

      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      args: 'one two',
      instances: 1,
      autorestart: true,
      watch: ['src/*.js'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'data'],
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
