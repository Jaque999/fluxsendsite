module.exports = {
  apps: [
    {
      name: "fluxsend",
      script: "npm",
      args: "start",
      cwd: "/var/www/fluxsend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATA_DIR: "/var/www/fluxsend/data",
        STORAGE_DIR: "/var/www/fluxsend/storage",
        TOKEN_PEPPER: process.env.TOKEN_PEPPER || "CHANGE_THIS_TO_RANDOM_STRING",
        BASE_URL: process.env.BASE_URL || "http://localhost:3000",
      },
      error_file: "/var/www/fluxsend/logs/pm2-error.log",
      out_file: "/var/www/fluxsend/logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};

