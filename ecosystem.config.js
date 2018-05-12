module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'steemstem',
      script: 'dist/busy.server.js',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '600M',
    },
  ],
};
