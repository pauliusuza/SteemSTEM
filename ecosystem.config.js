module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      script: 'build/server.js',
      name: 'steemstem',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '600M',
    },
  ],
};
