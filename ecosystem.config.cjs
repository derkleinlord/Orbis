module.exports = {
  apps: [{
    name: "orbis-backend",
    cwd: "./apps/backend",
    script: "dist/server.js",
    env: { NODE_ENV: "production" },
    autorestart: true,
    max_memory_restart: "512M"
  }]
};
