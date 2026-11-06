// PM2 cluster: runs one Node process per CPU core. Stateless API => scales
// horizontally. Start with: npm run build && npm run start:cluster
module.exports = {
  apps: [
    {
      name: "mocktest-api",
      script: "dist/server.js",
      instances: "max", // one per CPU core
      exec_mode: "cluster",
      env: { NODE_ENV: "production" },
    },
  ],
};
