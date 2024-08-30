module.exports = {
  apps: [
    {
      name: 'mmbot',
      script: 'pnpm',
      args: 'start',
      instances: 0, // starts maximum number of instances based on available CPUs
      port: 3005,
      max_memory_restart: '500M', // memory for each instance to consume before restarting
      exec_mode: 'cluster_mode',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
