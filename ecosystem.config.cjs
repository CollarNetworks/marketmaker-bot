module.exports = {
  apps: [
    {
      name: 'mmbot',
      script: 'pnpm',
      args: 'runbot',
      instances: 1,
      port: 3005,
      max_memory_restart: '500M',
      exec_mode: 'cluster_mode',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
